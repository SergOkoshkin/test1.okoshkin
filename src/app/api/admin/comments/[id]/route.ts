import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-server";

const patchSchema = z.object({
  name: z.string().trim().min(2).max(80),
  body: z.string().trim().min(10).max(1000),
  rating: z.number().int().min(1).max(5),
  photoUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Props) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json();
  const parsed = patchSchema.safeParse({
    ...json,
    rating: Number(json?.rating),
  });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }

  const item = await prisma.comment.update({
    where: { id },
    data: {
      name: parsed.data.name,
      body: parsed.data.body,
      rating: parsed.data.rating,
      photoUrl: parsed.data.photoUrl || null,
      status: parsed.data.status,
    },
    select: {
      id: true,
      name: true,
      body: true,
      rating: true,
      photoUrl: true,
      status: true,
    },
  });

  return NextResponse.json({ ok: true, item });
}

export async function DELETE(_request: Request, { params }: Props) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
