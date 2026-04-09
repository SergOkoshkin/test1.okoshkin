import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-server";
import { isImageFile, uploadImageFile } from "@/lib/r2";

const schema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  imageUrl: z.url().max(500),
  category: z.string().trim().min(2).max(60),
  isPublished: z.boolean().default(true),
});

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let imageUrl = "";
  let payload: {
    title: string;
    description: string;
    category: string;
    isPublished: boolean;
  };

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("image");
    imageUrl = getFormValue(formData, "imageUrl");

    if (isImageFile(file)) {
      try {
        imageUrl = await uploadImageFile(file, "okoshkin/gallery");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Image upload failed.";
        return NextResponse.json({ ok: false, message }, { status: 400 });
      }
    }

    payload = {
      title: getFormValue(formData, "title"),
      description: getFormValue(formData, "description"),
      category: getFormValue(formData, "category"),
      isPublished: formData.get("isPublished") === "true",
    };
  } else {
    const json = await request.json();
    imageUrl = String(json?.imageUrl ?? "");
    payload = {
      title: String(json?.title ?? ""),
      description: String(json?.description ?? ""),
      category: String(json?.category ?? ""),
      isPublished: Boolean(json?.isPublished),
    };
  }

  const parsed = schema.safeParse({
    ...payload,
    imageUrl,
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid gallery data" }, { status: 400 });
  }

  const item = await prisma.galleryItem.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      imageUrl,
      category: parsed.data.category,
      isPublished: parsed.data.isPublished,
    },
  });

  return NextResponse.json({ ok: true, item });
}
