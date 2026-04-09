import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasValidDatabaseUrl } from "@/lib/env";
import { isImageFile, uploadImageFile } from "@/lib/r2";

const commentSchema = z.object({
  name: z.string().trim().min(2).max(80),
  body: z.string().trim().min(10).max(1000),
  rating: z.coerce.number().int().min(1).max(5),
  photoUrl: z.string().url().max(500).optional().or(z.literal("")),
});

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function GET() {
  if (!hasValidDatabaseUrl()) {
    return NextResponse.json({ ok: true, items: [] });
  }

  const items = await prisma.comment.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      name: true,
      body: true,
      rating: true,
      photoUrl: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  try {
    if (!hasValidDatabaseUrl()) {
      return NextResponse.json(
        { ok: false, message: "Database is not configured yet." },
        { status: 400 },
      );
    }

    const contentType = request.headers.get("content-type") ?? "";
    let photoUrl = "";
    let payload: { name: string; body: string; rating: string | number };

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("photo");
      photoUrl = getFormValue(formData, "photoUrl");

      if (isImageFile(file)) {
        try {
          photoUrl = await uploadImageFile(file, "okoshkin/comments");
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Photo upload failed.";
          return NextResponse.json({ ok: false, message }, { status: 400 });
        }
      }

      payload = {
        name: getFormValue(formData, "name"),
        body: getFormValue(formData, "body"),
        rating: getFormValue(formData, "rating"),
      };
    } else {
      const json = await request.json();
      photoUrl = String(json?.photoUrl ?? "");
      payload = {
        name: String(json?.name ?? ""),
        body: String(json?.body ?? ""),
        rating: Number(json?.rating ?? 0),
      };
    }

    const parsed = commentSchema.safeParse({
      ...payload,
      photoUrl,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid form fields." },
        { status: 400 },
      );
    }

    await prisma.comment.create({
      data: {
        name: parsed.data.name,
        body: parsed.data.body,
        rating: parsed.data.rating,
        photoUrl: photoUrl || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Review submitted and sent for moderation.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Server error." },
      { status: 500 },
    );
  }
}
