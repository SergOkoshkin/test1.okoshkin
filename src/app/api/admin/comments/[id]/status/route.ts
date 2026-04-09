import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-server";

const schema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
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
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: { status: parsed.data.status },
    select: { id: true, status: true },
  });

  return NextResponse.json({ ok: true, item: updated });
}
