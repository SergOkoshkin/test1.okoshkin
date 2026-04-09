import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function getEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name} in .env`);
  }
  return value;
}

function getR2Config() {
  const accountId = getEnv("R2_ACCOUNT_ID");
  const accessKeyId = getEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getEnv("R2_SECRET_ACCESS_KEY");
  const bucketName = getEnv("R2_BUCKET_NAME");
  const publicBaseUrl = getEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
  if (publicBaseUrl.includes(".r2.cloudflarestorage.com")) {
    throw new Error(
      "R2_PUBLIC_BASE_URL must be public (r2.dev or custom domain), not r2.cloudflarestorage.com",
    );
  }

  return {
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicBaseUrl,
  };
}

let s3Client: S3Client | null = null;

function getS3Client() {
  if (!s3Client) {
    const cfg = getR2Config();
    s3Client = new S3Client({
      region: "auto",
      endpoint: cfg.endpoint,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
    });
  }
  return s3Client;
}

function getSafeExtension(file: File) {
  const typeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };
  const byType = typeToExt[file.type];
  if (byType) return byType;

  const fileName = file.name || "";
  const parts = fileName.split(".");
  const ext = parts.length > 1 ? parts.pop() : "";
  return (ext || "bin").toLowerCase();
}

export function isImageFile(file: unknown): file is File {
  return file instanceof File && file.size > 0;
}

export async function uploadImageFile(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Max size is 8MB.");
  }

  const cfg = getR2Config();
  const client = getS3Client();
  const extension = getSafeExtension(file);
  const safeFolder = folder.replace(/^\/+|\/+$/g, "");
  const key = `${safeFolder}/${Date.now()}-${randomUUID()}.${extension}`;
  const body = Buffer.from(await file.arrayBuffer());

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: cfg.bucketName,
        Key: key,
        Body: body,
        ContentType: file.type,
      }),
    );
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`R2 upload failed: ${details}`);
  }

  return `${cfg.publicBaseUrl}/${key}`;
}

function trimUrlSegments(pathname: string) {
  return pathname.split("/").filter(Boolean);
}

export function getObjectKeyFromImageUrl(imageUrl: string) {
  const cfg = getR2Config();

  try {
    const image = new URL(imageUrl);
    const publicBase = new URL(cfg.publicBaseUrl);
    const imageSegments = trimUrlSegments(image.pathname);
    const publicSegments = trimUrlSegments(publicBase.pathname);

    if (image.host === publicBase.host) {
      const isPrefixed = publicSegments.every((segment, index) => imageSegments[index] === segment);
      if (!isPrefixed) return null;
      const key = imageSegments.slice(publicSegments.length).join("/");
      return key || null;
    }

    const endpoint = new URL(cfg.endpoint);
    if (image.host === endpoint.host) {
      if (imageSegments[0] !== cfg.bucketName) return null;
      const key = imageSegments.slice(1).join("/");
      return key || null;
    }
  } catch {
    return null;
  }

  return null;
}

export async function deleteImageByUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return;

  const key = getObjectKeyFromImageUrl(imageUrl);
  if (!key) return;

  const cfg = getR2Config();
  const client = getS3Client();

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: cfg.bucketName,
        Key: key,
      }),
    );
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`R2 delete failed: ${details}`);
  }
}
