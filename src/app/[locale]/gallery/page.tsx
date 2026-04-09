import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { GalleryPageClient } from "@/components/gallery-page-client";
import { authOptions } from "@/lib/auth-options";
import { hasValidDatabaseUrl } from "@/lib/env";
import { isLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

function resolveImageUrl(imageUrl: string) {
  if (!imageUrl.includes(".r2.cloudflarestorage.com")) return imageUrl;

  const publicBase = (process.env.R2_PUBLIC_BASE_URL ?? "").trim().replace(/\/+$/, "");
  if (!publicBase || publicBase.includes(".r2.cloudflarestorage.com")) return imageUrl;

  try {
    const url = new URL(imageUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return imageUrl;
    const key = segments.slice(1).join("/");
    return `${publicBase}/${key}`;
  } catch {
    return imageUrl;
  }
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await getServerSession(authOptions);
  const isAdmin = Boolean(session?.user?.role === "admin");

  const items =
    hasValidDatabaseUrl()
      ? await prisma.galleryItem.findMany({
          where: isAdmin ? undefined : { isPublished: true },
          orderBy: { createdAt: "desc" },
          take: 120,
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            category: true,
            isPublished: true,
          },
        })
      : [];

  const normalized = items.map((item) => ({
    ...item,
    imageUrl: resolveImageUrl(item.imageUrl),
  }));

  return <GalleryPageClient locale={locale} isAdmin={isAdmin} initialItems={normalized} />;
}
