export type CalculatorOptionType =
  | "profileBrand"
  | "profileSystem"
  | "glassPackage"
  | "addon"
  | "openingType"
  | "color";

export type CalculatorOptionRecord = {
  id: string;
  type: CalculatorOptionType;
  key: string;
  labelRu: string;
  labelUk: string;
  multiplier: number;
  isActive: boolean;
};

type DefaultOption = Omit<CalculatorOptionRecord, "id">;

const DEFAULT_OPTIONS: DefaultOption[] = [
  { type: "profileBrand", key: "rehau", labelRu: "Rehau", labelUk: "Rehau", multiplier: 1, isActive: true },
  { type: "profileBrand", key: "salamander", labelRu: "Salamander", labelUk: "Salamander", multiplier: 1.04, isActive: true },
  { type: "profileBrand", key: "openteck", labelRu: "OpenTeck", labelUk: "OpenTeck", multiplier: 0.96, isActive: true },
  { type: "profileBrand", key: "wds", labelRu: "WDS", labelUk: "WDS", multiplier: 0.98, isActive: true },
  { type: "profileBrand", key: "decco", labelRu: "DECCO", labelUk: "DECCO", multiplier: 1.02, isActive: true },

  { type: "profileSystem", key: "design60", labelRu: "Design 60", labelUk: "Design 60", multiplier: 1, isActive: true },
  { type: "profileSystem", key: "design70", labelRu: "Design 70", labelUk: "Design 70", multiplier: 1.08, isActive: true },
  { type: "profileSystem", key: "synego", labelRu: "Synego", labelUk: "Synego", multiplier: 1.16, isActive: true },
  { type: "profileSystem", key: "euro70", labelRu: "Euro 70", labelUk: "Euro 70", multiplier: 1.06, isActive: true },
  { type: "profileSystem", key: "premium86", labelRu: "Premium 86", labelUk: "Premium 86", multiplier: 1.18, isActive: true },

  { type: "glassPackage", key: "single", labelRu: "Однокамерный", labelUk: "Однокамерний", multiplier: 1, isActive: true },
  { type: "glassPackage", key: "double", labelRu: "Двухкамерный", labelUk: "Двокамерний", multiplier: 1.12, isActive: true },
  { type: "glassPackage", key: "energy", labelRu: "Энергосберегающий", labelUk: "Енергозберігаючий", multiplier: 1.09, isActive: true },
  { type: "glassPackage", key: "solar", labelRu: "Солнцезащитный", labelUk: "Сонцезахисний", multiplier: 1.11, isActive: true },

  { type: "addon", key: "slopes", labelRu: "Откосы", labelUk: "Укоси", multiplier: 1.05, isActive: true },
  { type: "addon", key: "sill", labelRu: "Подоконник", labelUk: "Підвіконня", multiplier: 1.03, isActive: true },
  { type: "addon", key: "mosquito", labelRu: "Москитная сетка", labelUk: "Москітна сітка", multiplier: 1.02, isActive: true },
  { type: "addon", key: "demount", labelRu: "Демонтаж", labelUk: "Демонтаж", multiplier: 1.04, isActive: true },
  { type: "addon", key: "delivery", labelRu: "Подъём и доставка", labelUk: "Підйом і доставка", multiplier: 1.03, isActive: true },

  { type: "openingType", key: "fixed", labelRu: "Глухое", labelUk: "Глухе", multiplier: 1, isActive: true },
  { type: "openingType", key: "turn", labelRu: "Поворотное", labelUk: "Поворотне", multiplier: 1.05, isActive: true },
  { type: "openingType", key: "tiltTurn", labelRu: "Поворотно-откидное", labelUk: "Поворотно-відкидне", multiplier: 1.08, isActive: true },
  { type: "openingType", key: "sliding", labelRu: "Раздвижное", labelUk: "Розсувне", multiplier: 1.1, isActive: true },

  { type: "color", key: "white", labelRu: "Белый", labelUk: "Білий", multiplier: 1, isActive: true },
  { type: "color", key: "anthracite", labelRu: "Антрацит", labelUk: "Антрацит", multiplier: 1.1, isActive: true },
  { type: "color", key: "goldenOak", labelRu: "Золотой дуб", labelUk: "Золотий дуб", multiplier: 1.12, isActive: true },
  { type: "color", key: "walnut", labelRu: "Орех", labelUk: "Горіх", multiplier: 1.12, isActive: true },
];

export function getDefaultCalculatorOptions(): CalculatorOptionRecord[] {
  return DEFAULT_OPTIONS.map((item) => ({
    ...item,
    id: `default-${item.type}-${item.key}`,
  }));
}

export function mergeCalculatorOptions(
  databaseOptions: Array<{
    id: string;
    type: string;
    key: string;
    labelRu: string;
    labelUk: string;
    multiplier: number;
    isActive: boolean;
  }>,
): CalculatorOptionRecord[] {
  const filtered = databaseOptions.filter((item): item is CalculatorOptionRecord =>
    ["profileBrand", "profileSystem", "glassPackage", "addon", "openingType", "color"].includes(item.type),
  );

  if (filtered.length === 0) return getDefaultCalculatorOptions();

  const byIdentity = new Map(filtered.map((item) => [`${item.type}:${item.key}`, item]));
  const merged = [...filtered];

  for (const fallback of getDefaultCalculatorOptions()) {
    const identity = `${fallback.type}:${fallback.key}`;
    if (!byIdentity.has(identity)) merged.push(fallback);
  }

  return merged.sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return a.labelRu.localeCompare(b.labelRu);
  });
}

export function getOptionLabel(
  option: Pick<CalculatorOptionRecord, "labelRu" | "labelUk">,
  locale: "ru" | "uk",
) {
  return locale === "uk" ? option.labelUk : option.labelRu;
}

export function buildOptionMultiplierMap(options: CalculatorOptionRecord[]) {
  const map = new Map<string, number>();
  for (const option of options) {
    if (!option.isActive) continue;
    map.set(`${option.type}:${option.key}`, option.multiplier);
  }
  return map;
}
