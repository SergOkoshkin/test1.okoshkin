import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateEstimate } from "@/lib/calc";
import {
  buildOptionMultiplierMap,
  getDefaultCalculatorOptions,
  mergeCalculatorOptions,
} from "@/lib/calculator-options";
import { hasValidDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sendTelegramLeadNotification } from "@/lib/telegram";

const leadSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(5).max(30),
  productType: z.string().min(2).max(60),
  constructionKey: z.string().min(2).max(60),
  profileBrand: z.string().min(2).max(60),
  profileSystem: z.string().min(2).max(60),
  glassPackage: z.string().min(2).max(60),
  openingType: z.string().max(60).optional().nullable(),
  openingSide: z.enum(["left", "right"]).optional().nullable(),
  color: z.string().min(2).max(60),
  addons: z.array(z.string().min(2).max(60)).default([]),
  width: z.number().int().min(300).max(6000),
  height: z.number().int().min(300).max(6000),
  locale: z.string().default("ru"),
  comment: z.string().max(500).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = leadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Неверные данные формы." },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const canUseDb = hasValidDatabaseUrl();
    const calculatorOptions = canUseDb
      ? mergeCalculatorOptions(
          await prisma.calculatorOption.findMany({
            orderBy: [{ type: "asc" }, { createdAt: "asc" }],
          }),
        )
      : getDefaultCalculatorOptions();
    const multiplierMap = buildOptionMultiplierMap(calculatorOptions);

    const estimate = calculateEstimate(
      {
        productType: data.productType,
        constructionKey: data.constructionKey,
        profileBrand: data.profileBrand,
        profileSystem: data.profileSystem,
        glassPackage: data.glassPackage,
        openingType: data.openingType ?? undefined,
        color: data.color,
        addons: data.addons,
        width: data.width,
        height: data.height,
      },
      multiplierMap,
    );

    let leadId: string | null = null;
    const configSummary = [
      `construction=${data.constructionKey}`,
      `profileBrand=${data.profileBrand}`,
      `profileSystem=${data.profileSystem}`,
      `glassPackage=${data.glassPackage}`,
      `openingType=${data.openingType ?? ""}`,
      `openingSide=${data.openingSide ?? ""}`,
      `color=${data.color}`,
      `addons=${data.addons.join(",")}`,
      data.comment ? `note=${data.comment}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    if (canUseDb) {
      const lead = await prisma.lead.create({
        data: {
          name: data.name,
          phone: data.phone,
          productType: data.productType,
          profile: `${data.profileBrand}:${data.profileSystem}`,
          width: data.width,
          height: data.height,
          comment: configSummary,
          estimateMin: estimate.estimateMin,
          estimateMax: estimate.estimateMax,
          locale: data.locale,
        },
      });
      leadId = lead.id;
    }

    await sendTelegramLeadNotification({
      name: data.name,
      phone: data.phone,
      productType: `${data.productType} / ${data.constructionKey}`,
      profile: `${data.profileBrand} / ${data.profileSystem} / ${data.glassPackage}`,
      width: data.width,
      height: data.height,
      estimateMin: estimate.estimateMin,
      estimateMax: estimate.estimateMax,
      locale: data.locale,
      comment: configSummary,
    });

    return NextResponse.json({
      ok: true,
      message:
        data.locale === "uk"
          ? "Заявку прийнято. Менеджер зв'яжеться з вами."
          : "Заявка принята. Менеджер свяжется с вами.",
      estimateMin: estimate.estimateMin,
      estimateMax: estimate.estimateMax,
      leadId,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Внутренняя ошибка сервера." },
      { status: 500 },
    );
  }
}
