import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-server";
import { mergeCalculatorOptions } from "@/lib/calculator-options";

const schema = z.object({
  type: z.enum(["profileBrand", "profileSystem", "glassPackage", "addon", "openingType", "color"]),
  key: z.string().trim().min(2).max(60),
  labelRu: z.string().trim().min(2).max(100),
  labelUk: z.string().trim().min(2).max(100),
  multiplier: z.number().min(0.5).max(2.5),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const options = await prisma.calculatorOption.findMany({
    orderBy: [{ type: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ ok: true, options: mergeCalculatorOptions(options) });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = schema.safeParse({
    ...json,
    multiplier: Number(json?.multiplier),
    isActive: Boolean(json?.isActive),
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid option data" }, { status: 400 });
  }

  const option = await prisma.calculatorOption.create({
    data: parsed.data,
  });

  return NextResponse.json({ ok: true, option });
}
