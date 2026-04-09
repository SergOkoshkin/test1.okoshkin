import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-server";
import { deleteImageByUrl, isImageFile, uploadImageFile } from "@/lib/r2";

type Props = {
  params: Promise<{ id: string }>;
};

const patchSchema = z.object({
title: z.string().trim().min(2).max(120),
description: z.string().trim().max(400).optional().or(z.literal("")),
imageUrl: z.string().url().max(500),
category: z.string().trim().min(2).max(60),
isPublished: z.boolean(),
});

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function PATCH(request: Request, { params }: Props) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existingItem = await prisma.galleryItem.findUnique({ where: { id } });
  if (!existingItem) {
    return NextResponse.json({ ok: false, message: "Gallery item not found" }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let imageUrl = "";
  let uploadedNewFile = false;
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
        uploadedNewFile = true;
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

  const parsed = patchSchema.safeParse({
    ...payload,
    imageUrl,
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }

  const item = await prisma.galleryItem.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      imageUrl,
      category: parsed.data.category,
      isPublished: parsed.data.isPublished,
    },
  });

  if (uploadedNewFile && existingItem.imageUrl !== item.imageUrl) {
    try {
      await deleteImageByUrl(existingItem.imageUrl);
    } catch {
      // Best effort cleanup for replaced files. Keep the update successful.
    }
  }

  return NextResponse.json({ ok: true, item });
}

export async function DELETE(_request: Request, { params }: Props) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ ok: false, message: "Gallery item not found" }, { status: 404 });
  }

  try {
    await deleteImageByUrl(item.imageUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete image from cloud";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }

  await prisma.galleryItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
