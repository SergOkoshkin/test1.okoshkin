export const PRODUCT_BASE_RATE: Record<string, number> = {
  windows: 4600,
  doors: 5200,
  balcony: 5600,
  roller: 3600,
  blinds: 2400,
};

export const CONSTRUCTION_MULTIPLIER: Record<string, number> = {
  singleWindow: 1,
  doubleWindow: 1.16,
  tripleWindow: 1.28,
  balconyDoor: 1.22,
  balconyBlock: 1.36,
  entranceDoor: 1.24,
  slidingDoor: 1.34,
  rollerShutter: 1.08,
  venetianBlinds: 1.02,
};

export type EstimateInput = {
  productType: string;
  constructionKey: string;
  profileBrand?: string;
  profileSystem?: string;
  glassPackage?: string;
  openingType?: string;
  color?: string;
  addons?: string[];
  width: number;
  height: number;
};

function getMultiplier(
  multiplierMap: Map<string, number> | undefined,
  type: string,
  key: string | undefined,
  fallback = 1,
) {
  if (!key) return fallback;
  return multiplierMap?.get(`${type}:${key}`) ?? fallback;
}

export function calculateEstimate(
  {
    productType,
    constructionKey,
    profileBrand,
    profileSystem,
    glassPackage,
    openingType,
    color,
    addons = [],
    width,
    height,
  }: EstimateInput,
  multiplierMap?: Map<string, number>,
) {
  const baseRate = PRODUCT_BASE_RATE[productType] ?? PRODUCT_BASE_RATE.windows;
  const constructionMultiplier =
    CONSTRUCTION_MULTIPLIER[constructionKey] ?? CONSTRUCTION_MULTIPLIER.singleWindow;

  const profileBrandMultiplier = getMultiplier(multiplierMap, "profileBrand", profileBrand, 1);
  const profileSystemMultiplier = getMultiplier(multiplierMap, "profileSystem", profileSystem, 1);
  const glassMultiplier = getMultiplier(multiplierMap, "glassPackage", glassPackage, 1);
  const openingMultiplier = getMultiplier(multiplierMap, "openingType", openingType, 1);
  const colorMultiplier = getMultiplier(multiplierMap, "color", color, 1);

  const area = Math.max(0.2, (width * height) / 1_000_000);
  const perimeterFactor = Math.max(1, (width + height) / 3000);
  const installPrice = area * 850 + perimeterFactor * 320;

  let subtotal =
    area *
      baseRate *
      constructionMultiplier *
      profileBrandMultiplier *
      profileSystemMultiplier *
      glassMultiplier *
      openingMultiplier *
      colorMultiplier +
    installPrice;

  for (const addon of addons) {
    subtotal *= getMultiplier(multiplierMap, "addon", addon, 1);
  }

  const estimateMin = Math.round(subtotal * 0.92);
  const estimateMax = Math.round(subtotal * 1.14);

  return { estimateMin, estimateMax };
}
