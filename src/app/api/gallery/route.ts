import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasValidDatabaseUrl } from "@/lib/env";

export async function GET(request: NextRequest) {
  if (!hasValidDatabaseUrl()) {
    return NextResponse.json({ ok: true, items: [] });
  }

  const takeRaw = Number(request.nextUrl.searchParams.get("take") ?? 8);
  const take = Number.isNaN(takeRaw) ? 8 : Math.min(Math.max(takeRaw, 1), 30);

  const items = await prisma.galleryItem.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      category: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, items });
}
