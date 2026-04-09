import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-server";

type Props = {
  params: Promise<{ id: string }>;
};

const schema = z.object({
  type: z.enum(["profileBrand", "profileSystem", "glassPackage", "addon", "openingType", "color"]),
  key: z.string().trim().min(2).max(60),
  labelRu: z.string().trim().min(2).max(100),
  labelUk: z.string().trim().min(2).max(100),
  multiplier: z.number().min(0.5).max(2.5),
  isActive: z.boolean(),
});

export async function PATCH(request: Request, { params }: Props) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json();
  const parsed = schema.safeParse({
    ...json,
    multiplier: Number(json?.multiplier),
    isActive: Boolean(json?.isActive),
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid option payload" }, { status: 400 });
  }

  const option = await prisma.calculatorOption.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true, option });
}

export async function DELETE(_request: Request, { params }: Props) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.calculatorOption.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
