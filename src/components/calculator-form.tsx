"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { calculateEstimate } from "@/lib/calc";
import {
  buildOptionMultiplierMap,
  CalculatorOptionRecord,
  CalculatorOptionType,
  getOptionLabel,
} from "@/lib/calculator-options";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  isAdmin: boolean;
  initialOptions: CalculatorOptionRecord[];
};

type ProductGroup = "windows" | "doors" | "balcony" | "roller" | "blinds";
type OpeningSide = "left" | "right";

type Construction = {
  key: string;
  group: ProductGroup;
  titleRu: string;
  titleUk: string;
  descriptionRu: string;
  descriptionUk: string;
  defaultWidth: number;
  defaultHeight: number;
  supportsOpening: boolean;
  supportsGlass: boolean;
  variant:
    | "singleWindow"
    | "doubleWindow"
    | "tripleWindow"
    | "balconyDoor"
    | "balconyBlock"
    | "entranceDoor"
    | "slidingDoor"
    | "rollerShutter"
    | "venetianBlinds";
};

type LeadResponse = {
  ok: boolean;
  message: string;
  estimateMin?: number;
  estimateMax?: number;
};

type AdminResponse = {
  ok: boolean;
  message?: string;
  option?: CalculatorOptionRecord;
  options?: CalculatorOptionRecord[];
};

type OptionDraft = {
  type: CalculatorOptionType;
  key: string;
  labelRu: string;
  labelUk: string;
  multiplier: string;
  isActive: boolean;
};

const constructions: Construction[] = [
  {
    key: "singleWindow",
    group: "windows",
    titleRu: "Одностворчатое окно",
    titleUk: "Одностулкове вікно",
    descriptionRu: "Классическая конструкция для кухни, спальни и небольших комнат.",
    descriptionUk: "Класична конструкція для кухні, спальні та невеликих кімнат.",
    defaultWidth: 900,
    defaultHeight: 1400,
    supportsOpening: true,
    supportsGlass: true,
    variant: "singleWindow",
  },
  {
    key: "doubleWindow",
    group: "windows",
    titleRu: "Двухстворчатое окно",
    titleUk: "Двостулкове вікно",
    descriptionRu: "Популярный вариант для жилых комнат и офисов.",
    descriptionUk: "Популярний варіант для житлових кімнат та офісів.",
    defaultWidth: 1300,
    defaultHeight: 1400,
    supportsOpening: true,
    supportsGlass: true,
    variant: "doubleWindow",
  },
  {
    key: "tripleWindow",
    group: "windows",
    titleRu: "Трехстворчатое окно",
    titleUk: "Тристулкове вікно",
    descriptionRu: "Для широких проемов, гостиных и фасадных зон.",
    descriptionUk: "Для широких прорізів, віталень і фасадних зон.",
    defaultWidth: 1800,
    defaultHeight: 1450,
    supportsOpening: true,
    supportsGlass: true,
    variant: "tripleWindow",
  },
  {
    key: "balconyDoor",
    group: "balcony",
    titleRu: "Балконная дверь",
    titleUk: "Балконні двері",
    descriptionRu: "Одиночная дверь на балкон или террасу.",
    descriptionUk: "Окремі двері на балкон або терасу.",
    defaultWidth: 800,
    defaultHeight: 2100,
    supportsOpening: true,
    supportsGlass: true,
    variant: "balconyDoor",
  },
  {
    key: "balconyBlock",
    group: "balcony",
    titleRu: "Балконный блок",
    titleUk: "Балконний блок",
    descriptionRu: "Комбинация двери и окна для балконного выхода.",
    descriptionUk: "Комбінація дверей та вікна для балконного виходу.",
    defaultWidth: 2000,
    defaultHeight: 2100,
    supportsOpening: true,
    supportsGlass: true,
    variant: "balconyBlock",
  },
  {
    key: "entranceDoor",
    group: "doors",
    titleRu: "Входная дверь",
    titleUk: "Вхідні двері",
    descriptionRu: "Дверная система с усиленной рамой и надежной фурнитурой.",
    descriptionUk: "Дверна система з посиленою рамою та надійною фурнітурою.",
    defaultWidth: 950,
    defaultHeight: 2100,
    supportsOpening: true,
    supportsGlass: true,
    variant: "entranceDoor",
  },
  {
    key: "slidingDoor",
    group: "doors",
    titleRu: "Раздвижная система",
    titleUk: "Розсувна система",
    descriptionRu: "Для выхода на террасу, зимний сад или широкий проем.",
    descriptionUk: "Для виходу на терасу, зимовий сад або широкий проріз.",
    defaultWidth: 2200,
    defaultHeight: 2100,
    supportsOpening: true,
    supportsGlass: true,
    variant: "slidingDoor",
  },
  {
    key: "rollerShutter",
    group: "roller",
    titleRu: "Роллеты",
    titleUk: "Ролети",
    descriptionRu: "Защита от солнца и дополнительная безопасность фасада.",
    descriptionUk: "Захист від сонця та додаткова безпека фасаду.",
    defaultWidth: 1500,
    defaultHeight: 1500,
    supportsOpening: false,
    supportsGlass: false,
    variant: "rollerShutter",
  },
  {
    key: "venetianBlinds",
    group: "blinds",
    titleRu: "Жалюзи",
    titleUk: "Жалюзі",
    descriptionRu: "Регулировка света и приватности для дома и офиса.",
    descriptionUk: "Регулювання світла та приватності для дому й офісу.",
    defaultWidth: 1400,
    defaultHeight: 1400,
    supportsOpening: false,
    supportsGlass: false,
    variant: "venetianBlinds",
  },
];

const colorSwatches: Record<string, string> = {
  white: "#f4f7f3",
  anthracite: "#59606a",
  goldenOak: "#b9864a",
  walnut: "#6e4938",
};

const copy = {
  ru: {
    title: "Калькулятор конструкций",
    subtitle:
      "Выберите тип изделия, пример конструкции и параметры. Стоимость рассчитывается ориентировочно, а финальную смету подтверждаем после замера.",
    groupTitle: "Что считаем",
    exampleTitle: "Выберите конструкцию",
    previewTitle: "Предпросмотр",
    optionsTitle: "Профиль, стеклопакет и опции",
    dimensionsTitle: "Размер конструкции",
    width: "Ширина",
    height: "Высота",
    mm: "мм",
    profileBrand: "Тип профиля",
    profileSystem: "Система",
    glassPackage: "Стеклопакет",
    openingType: "Открывание",
    openingSide: "Сторона открывания",
    color: "Цвет",
    addons: "Дополнительные опции",
    estimate: "Предварительная цена",
    estimateHint: "Цена ориентировочная и нужна для быстрого понимания бюджета.",
    contactTitle: "Оставить заявку",
    name: "Имя",
    phone: "Телефон",
    comment: "Комментарий",
    submit: "Отправить заявку",
    loading: "Считаем...",
    selectedConfig: "Выбрано",
    noOptions: "Нет активных опций",
    left: "Левое",
    right: "Правое",
    adminTitle: "Настройки калькулятора",
    adminSubtitle: "В режиме администратора здесь можно добавлять, редактировать и отключать опции без перехода в отдельную админку.",
    createOption: "Добавить опцию",
    save: "Сохранить",
    delete: "Удалить",
    multiplier: "Коэффициент",
    key: "Ключ",
    labelRu: "Название RU",
    labelUk: "Название UA",
    active: "Активно",
    type: "Тип опции",
    resultReady: "Ориентир готов",
    summary: "Что попадёт в заявку",
    summaryHint: "Эти параметры уйдут менеджеру вместе с контактами.",
    optionGroups: {
      profileBrand: "Бренды профиля",
      profileSystem: "Системы",
      glassPackage: "Стеклопакеты",
      addon: "Доп. опции",
      openingType: "Типы открывания",
      color: "Цвета",
    },
    productGroups: {
      windows: "Окна",
      doors: "Двери",
      balcony: "Балкон",
      roller: "Роллеты",
      blinds: "Жалюзи",
    },
  },
  uk: {
    title: "Калькулятор конструкцій",
    subtitle:
      "Оберіть тип виробу, приклад конструкції та параметри. Вартість розраховується орієнтовно, а фінальний кошторис підтверджуємо після заміру.",
    groupTitle: "Що рахуємо",
    exampleTitle: "Оберіть конструкцію",
    previewTitle: "Попередній перегляд",
    optionsTitle: "Профіль, склопакет та опції",
    dimensionsTitle: "Розмір конструкції",
    width: "Ширина",
    height: "Висота",
    mm: "мм",
    profileBrand: "Тип профілю",
    profileSystem: "Система",
    glassPackage: "Склопакет",
    openingType: "Відкривання",
    openingSide: "Сторона відкривання",
    color: "Колір",
    addons: "Додаткові опції",
    estimate: "Попередня ціна",
    estimateHint: "Ціна орієнтовна і потрібна для швидкого розуміння бюджету.",
    contactTitle: "Залишити заявку",
    name: "Ім'я",
    phone: "Телефон",
    comment: "Коментар",
    submit: "Надіслати заявку",
    loading: "Рахуємо...",
    selectedConfig: "Обрано",
    noOptions: "Немає активних опцій",
    left: "Ліве",
    right: "Праве",
    adminTitle: "Налаштування калькулятора",
    adminSubtitle: "У режимі адміністратора тут можна додавати, редагувати та вимикати опції без окремої адмінки.",
    createOption: "Додати опцію",
    save: "Зберегти",
    delete: "Видалити",
    multiplier: "Коефіцієнт",
    key: "Ключ",
    labelRu: "Назва RU",
    labelUk: "Назва UA",
    active: "Активно",
    type: "Тип опції",
    resultReady: "Орієнтир готовий",
    summary: "Що потрапить у заявку",
    summaryHint: "Ці параметри підуть менеджеру разом із контактами.",
    optionGroups: {
      profileBrand: "Бренди профілю",
      profileSystem: "Системи",
      glassPackage: "Склопакети",
      addon: "Додаткові опції",
      openingType: "Типи відкривання",
      color: "Кольори",
    },
    productGroups: {
      windows: "Вікна",
      doors: "Двері",
      balcony: "Балкон",
      roller: "Ролети",
      blinds: "Жалюзі",
    },
  },
} as const;

const optionTypeOrder: CalculatorOptionType[] = [
  "profileBrand",
  "profileSystem",
  "glassPackage",
  "openingType",
  "color",
  "addon",
];

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getConstructionLabel(item: Construction, locale: Locale) {
  return locale === "uk" ? item.titleUk : item.titleRu;
}

function getConstructionDescription(item: Construction, locale: Locale) {
  return locale === "uk" ? item.descriptionUk : item.descriptionRu;
}

function ConstructionPreview({
  construction,
  width,
  height,
  openingType,
  openingSide,
  colorKey,
}: {
  construction: Construction;
  width: number;
  height: number;
  openingType: string;
  openingSide: OpeningSide;
  colorKey: string;
}) {
  const stroke = colorSwatches[colorKey] ?? "rgba(73, 111, 94, 0.92)";
  const panelFill = "rgba(255,255,255,0.78)";
  const glassFill = "rgba(220, 236, 248, 0.62)";
  const frameX = 80;
  const frameY = 64;
  const frameWidth = 260;
  const frameHeight =
    construction.variant === "balconyDoor" ||
    construction.variant === "entranceDoor" ||
    construction.variant === "slidingDoor"
      ? 420
      : 320;
  const panelCount =
    construction.variant === "singleWindow" ||
    construction.variant === "balconyDoor" ||
    construction.variant === "entranceDoor"
      ? 1
      : construction.variant === "doubleWindow" || construction.variant === "slidingDoor"
        ? 2
        : construction.variant === "tripleWindow"
          ? 3
          : 2;
  const unitWidth = frameWidth / panelCount;
  const openTilt = openingType === "tiltTurn";
  const openTurn = openingType === "turn";
  const activeOpen = construction.supportsOpening && openingType !== "fixed";

  return (
    <svg viewBox="0 0 420 560" className="h-full w-full">
      <defs>
        <linearGradient id="preview-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fafdff" />
          <stop offset="100%" stopColor="#edf5f0" />
        </linearGradient>
      </defs>

      <rect x="24" y="24" width="372" height="512" rx="34" fill="url(#preview-bg)" />
      <rect x="46" y="46" width="328" height="468" rx="28" fill="rgba(255,255,255,0.72)" stroke="rgba(139,170,152,0.25)" />

      {construction.variant === "rollerShutter" ? (
        <>
          <rect x="110" y="132" width="200" height="46" rx="12" fill={stroke} opacity="0.18" />
          <rect x="124" y="180" width="172" height="208" rx="12" fill="rgba(255,255,255,0.78)" stroke={stroke} strokeWidth="6" />
          {Array.from({ length: 10 }).map((_, index) => (
            <line
              key={index}
              x1="132"
              x2="288"
              y1={198 + index * 18}
              y2={198 + index * 18}
              stroke={stroke}
              opacity={0.32 + index * 0.02}
              strokeWidth="3"
            />
          ))}
          <line x1="120" x2="120" y1="176" y2="404" stroke={stroke} strokeWidth="6" />
          <line x1="300" x2="300" y1="176" y2="404" stroke={stroke} strokeWidth="6" />
        </>
      ) : construction.variant === "venetianBlinds" ? (
        <>
          <rect x="120" y="110" width="180" height="320" rx="18" fill={panelFill} stroke={stroke} strokeWidth="6" />
          {Array.from({ length: 12 }).map((_, index) => (
            <line
              key={index}
              x1="138"
              x2="282"
              y1={136 + index * 22}
              y2={136 + index * 22}
              stroke={stroke}
              opacity="0.42"
              strokeWidth="4"
            />
          ))}
          <line x1="172" x2="172" y1="128" y2="416" stroke={stroke} opacity="0.25" strokeWidth="2" />
          <line x1="248" x2="248" y1="128" y2="416" stroke={stroke} opacity="0.25" strokeWidth="2" />
        </>
      ) : (
        <>
          <rect x={frameX} y={frameY} width={frameWidth} height={frameHeight} rx="22" fill={panelFill} stroke={stroke} strokeWidth="8" />
          {construction.variant === "balconyBlock" ? (
            <>
              <rect x="92" y="78" width="156" height="392" rx="18" fill={glassFill} stroke={stroke} strokeWidth="4" />
              <rect x="252" y="78" width="76" height="180" rx="14" fill={glassFill} stroke={stroke} strokeWidth="4" />
              <rect x="252" y="266" width="76" height="204" rx="14" fill={panelFill} stroke={stroke} strokeWidth="4" />
              <line x1="252" x2="328" y1="262" y2="262" stroke={stroke} strokeWidth="3" opacity="0.6" />
            </>
          ) : (
            <>
              {Array.from({ length: panelCount }).map((_, index) => {
                const x = frameX + index * unitWidth;
                const innerWidth = unitWidth - 8;
                const isActivePanel =
                  construction.supportsOpening &&
                  activeOpen &&
                  ((openingSide === "left" && index === 0) ||
                    (openingSide === "right" && index === panelCount - 1));

                return (
                  <g key={`${construction.key}-${index}`}>
                    <rect
                      x={x + 4}
                      y={frameY + 10}
                      width={innerWidth}
                      height={frameHeight - 20}
                      rx="14"
                      fill={glassFill}
                      stroke={stroke}
                      strokeWidth="3"
                    />
                    {isActivePanel ? (
                      <>
                        <line
                          x1={openingSide === "left" ? x + 14 : x + innerWidth}
                          x2={openingSide === "left" ? x + innerWidth - 12 : x + 14}
                          y1={frameY + 24}
                          y2={frameY + frameHeight - 28}
                          stroke={stroke}
                          strokeWidth="3.5"
                          opacity="0.9"
                        />
                        {openTilt ? (
                          <line
                            x1={x + 26}
                            x2={x + innerWidth - 26}
                            y1={frameY + 30}
                            y2={frameY + 56}
                            stroke={stroke}
                            strokeDasharray="6 6"
                            strokeWidth="2.5"
                            opacity="0.65"
                          />
                        ) : null}
                      </>
                    ) : null}
                    {index > 0 ? (
                      <line x1={x} x2={x} y1={frameY + 12} y2={frameY + frameHeight - 12} stroke={stroke} strokeWidth="4" opacity="0.54" />
                    ) : null}
                  </g>
                );
              })}
            </>
          )}

          {(construction.variant === "balconyDoor" || construction.variant === "entranceDoor") ? (
            <>
              <line x1="90" x2="330" y1="280" y2="280" stroke={stroke} strokeWidth="4" opacity="0.55" />
              <circle cx={openingSide === "left" ? 116 : 304} cy="260" r="7" fill={stroke} />
            </>
          ) : null}

          {construction.variant === "slidingDoor" ? (
            <>
              <line x1="210" x2="210" y1="84" y2="476" stroke={stroke} strokeWidth="6" opacity="0.4" />
              <path d="M150 500 C190 480 230 480 270 500" stroke={stroke} strokeWidth="4" fill="none" opacity="0.35" />
            </>
          ) : null}
        </>
      )}

      <path d="M74 510 H346" stroke="rgba(79, 113, 96, 0.18)" strokeWidth="4" strokeLinecap="round" />
      <path d="M58 504 V96" stroke="rgba(79, 113, 96, 0.14)" strokeWidth="2.5" strokeDasharray="8 8" />
      <path d="M360 504 V96" stroke="rgba(79, 113, 96, 0.14)" strokeWidth="2.5" strokeDasharray="8 8" />

      <text x="210" y="534" textAnchor="middle" fontSize="24" fill="#496f5e" fontWeight="600">
        {width} мм
      </text>
      <text x="32" y="286" transform="rotate(-90 32 286)" textAnchor="middle" fontSize="24" fill="#496f5e" fontWeight="600">
        {height} мм
      </text>

      {activeOpen ? (
        <g>
          <path
            d={openingSide === "left" ? "M96 84 C74 118 74 160 96 194" : "M324 84 C346 118 346 160 324 194"}
            fill="none"
            stroke={stroke}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d={openingSide === "left" ? "M90 92 L100 94 L96 106" : "M330 92 L320 94 L324 106"}
            fill="none"
            stroke={stroke}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {openTurn ? null : (
            <path d="M130 84 C180 64 240 64 290 84" fill="none" stroke={stroke} strokeWidth="3" opacity="0.5" strokeDasharray="10 8" />
          )}
        </g>
      ) : null}
    </svg>
  );
}

export function CalculatorForm({ locale, isAdmin, initialOptions }: Props) {
  const t = copy[locale];
  const previewRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);

  const [options, setOptions] = useState<CalculatorOptionRecord[]>(initialOptions);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup>("windows");
  const [selectedConstructionKey, setSelectedConstructionKey] = useState("singleWindow");
  const [width, setWidth] = useState(900);
  const [height, setHeight] = useState(1400);
  const [selectedProfileBrand, setSelectedProfileBrand] = useState("");
  const [selectedProfileSystem, setSelectedProfileSystem] = useState("");
  const [selectedGlassPackage, setSelectedGlassPackage] = useState("");
  const [selectedOpeningType, setSelectedOpeningType] = useState("");
  const [selectedOpeningSide, setSelectedOpeningSide] = useState<OpeningSide>("right");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [leadMessage, setLeadMessage] = useState<string | null>(null);
  const [leadOk, setLeadOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminOk, setAdminOk] = useState(false);
  const [busyOptionId, setBusyOptionId] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState<OptionDraft>({
    type: "profileBrand",
    key: "",
    labelRu: "",
    labelUk: "",
    multiplier: "1",
    isActive: true,
  });

  const activeOptions = useMemo(() => {
    const grouped = {
      profileBrand: [] as CalculatorOptionRecord[],
      profileSystem: [] as CalculatorOptionRecord[],
      glassPackage: [] as CalculatorOptionRecord[],
      addon: [] as CalculatorOptionRecord[],
      openingType: [] as CalculatorOptionRecord[],
      color: [] as CalculatorOptionRecord[],
    };

    for (const option of options) {
      if (!option.isActive) continue;
      grouped[option.type].push(option);
    }

    return grouped;
  }, [options]);

  const visibleConstructions = useMemo(
    () => constructions.filter((item) => item.group === selectedGroup),
    [selectedGroup],
  );

  const selectedConstruction =
    constructions.find((item) => item.key === selectedConstructionKey) ?? visibleConstructions[0];

  const openingOptions = useMemo(() => {
    if (!selectedConstruction?.supportsOpening) return [];
    if (selectedConstruction.variant === "slidingDoor") {
      return activeOptions.openingType.filter((item) => item.key === "sliding");
    }
    return activeOptions.openingType.filter((item) => item.key !== "sliding");
  }, [activeOptions.openingType, selectedConstruction]);

  const multiplierMap = useMemo(() => buildOptionMultiplierMap(options), [options]);

  const estimate = useMemo(() => {
    return calculateEstimate(
      {
        productType: selectedGroup,
        constructionKey: selectedConstruction?.key ?? "singleWindow",
        profileBrand: selectedProfileBrand || undefined,
        profileSystem: selectedProfileSystem || undefined,
        glassPackage: selectedGlassPackage || undefined,
        openingType: selectedConstruction?.supportsOpening ? selectedOpeningType || undefined : undefined,
        color: selectedColor || undefined,
        addons: selectedAddons,
        width,
        height,
      },
      multiplierMap,
    );
  }, [
    height,
    multiplierMap,
    selectedAddons,
    selectedColor,
    selectedConstruction,
    selectedGlassPackage,
    selectedGroup,
    selectedOpeningType,
    selectedProfileBrand,
    selectedProfileSystem,
    width,
  ]);

  const groupedOptionsForAdmin = useMemo(() => {
    return optionTypeOrder.map((type) => ({
      type,
      items: options.filter((item) => item.type === type),
    }));
  }, [options]);

  useEffect(() => {
    if (!visibleConstructions.some((item) => item.key === selectedConstructionKey)) {
      const fallback = visibleConstructions[0];
      if (fallback) setSelectedConstructionKey(fallback.key);
    }
  }, [selectedConstructionKey, visibleConstructions]);

  useEffect(() => {
    if (!selectedConstruction) return;
    setWidth(selectedConstruction.defaultWidth);
    setHeight(selectedConstruction.defaultHeight);
  }, [selectedConstructionKey, selectedConstruction]);

  useEffect(() => {
    const pickFirst = (items: CalculatorOptionRecord[]) => items[0]?.key ?? "";

    if (!activeOptions.profileBrand.some((item) => item.key === selectedProfileBrand)) {
      setSelectedProfileBrand(pickFirst(activeOptions.profileBrand));
    }
    if (!activeOptions.profileSystem.some((item) => item.key === selectedProfileSystem)) {
      setSelectedProfileSystem(pickFirst(activeOptions.profileSystem));
    }
    if (!activeOptions.glassPackage.some((item) => item.key === selectedGlassPackage)) {
      setSelectedGlassPackage(pickFirst(activeOptions.glassPackage));
    }
    if (!activeOptions.color.some((item) => item.key === selectedColor)) {
      setSelectedColor(pickFirst(activeOptions.color));
    }
  }, [
    activeOptions.color,
    activeOptions.glassPackage,
    activeOptions.profileBrand,
    activeOptions.profileSystem,
    selectedColor,
    selectedGlassPackage,
    selectedProfileBrand,
    selectedProfileSystem,
  ]);

  useEffect(() => {
    if (!selectedConstruction?.supportsOpening) {
      setSelectedOpeningType("");
      return;
    }

    if (!openingOptions.some((item) => item.key === selectedOpeningType)) {
      setSelectedOpeningType(openingOptions[0]?.key ?? "");
    }
  }, [openingOptions, selectedConstruction, selectedOpeningType]);

  useEffect(() => {
    setSelectedAddons((current) =>
      current.filter((key) => activeOptions.addon.some((item) => item.key === key)),
    );
  }, [activeOptions.addon]);

  useEffect(() => {
    if (!previewRef.current) return;
    gsap.fromTo(
      previewRef.current,
      { opacity: 0.4, scale: 0.96, y: 12 },
      { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "power2.out" },
    );
  }, [selectedConstructionKey, selectedOpeningType, selectedOpeningSide, selectedColor, width, height]);

  useEffect(() => {
    if (!priceRef.current) return;
    gsap.fromTo(
      priceRef.current,
      { opacity: 0.2, y: 8 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
    );
  }, [estimate.estimateMin, estimate.estimateMax]);

  function formatMoney(value: number) {
    return new Intl.NumberFormat(locale === "uk" ? "uk-UA" : "ru-RU").format(value);
  }

  function toggleAddon(key: string) {
    setSelectedAddons((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedConstruction) return;

    setLoading(true);
    setLeadMessage(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          productType: selectedGroup,
          constructionKey: selectedConstruction.key,
          profileBrand: selectedProfileBrand,
          profileSystem: selectedProfileSystem,
          glassPackage: selectedGlassPackage,
          openingType: selectedConstruction.supportsOpening ? selectedOpeningType : null,
          openingSide: selectedConstruction.supportsOpening ? selectedOpeningSide : null,
          color: selectedColor,
          addons: selectedAddons,
          width,
          height,
          locale,
          comment,
        }),
      });

      const data = (await response.json()) as LeadResponse;
      setLeadOk(Boolean(data.ok));
      setLeadMessage(data.message);

      if (data.ok) {
        setComment("");
        setName("");
        setPhone("");
      }
    } catch {
      setLeadOk(false);
      setLeadMessage(locale === "uk" ? "Не вдалося надіслати заявку." : "Не удалось отправить заявку.");
    } finally {
      setLoading(false);
    }
  }

  async function createOption(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdminMessage(null);
    setBusyOptionId("create");

    try {
      const response = await fetch("/api/admin/calculator-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createDraft,
          multiplier: Number(createDraft.multiplier),
        }),
      });

      const data = (await response.json()) as AdminResponse;
      if (!response.ok || !data.option) {
        throw new Error(data.message ?? "Create failed");
      }

      setOptions((current) =>
        [...current, data.option!].sort((a, b) =>
          a.type === b.type ? a.labelRu.localeCompare(b.labelRu) : a.type.localeCompare(b.type),
        ),
      );
      setAdminOk(true);
      setAdminMessage(locale === "uk" ? "Опцію додано." : "Опция добавлена.");
      setCreateDraft({
        type: createDraft.type,
        key: "",
        labelRu: "",
        labelUk: "",
        multiplier: "1",
        isActive: true,
      });
    } catch {
      setAdminOk(false);
      setAdminMessage(locale === "uk" ? "Не вдалося додати опцію." : "Не удалось добавить опцию.");
    } finally {
      setBusyOptionId(null);
    }
  }

  async function saveOption(option: CalculatorOptionRecord) {
    setAdminMessage(null);
    setBusyOptionId(option.id);

    try {
      const response = await fetch(`/api/admin/calculator-options/${option.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: option.type,
          key: option.key,
          labelRu: option.labelRu,
          labelUk: option.labelUk,
          multiplier: Number(option.multiplier),
          isActive: option.isActive,
        }),
      });

      const data = (await response.json()) as AdminResponse;
      if (!response.ok || !data.option) {
        throw new Error(data.message ?? "Save failed");
      }

      setOptions((current) => current.map((item) => (item.id === option.id ? data.option! : item)));
      setAdminOk(true);
      setAdminMessage(locale === "uk" ? "Зміни збережено." : "Изменения сохранены.");
    } catch {
      setAdminOk(false);
      setAdminMessage(locale === "uk" ? "Не вдалося зберегти опцію." : "Не удалось сохранить опцию.");
    } finally {
      setBusyOptionId(null);
    }
  }

  async function deleteOption(id: string) {
    setAdminMessage(null);
    setBusyOptionId(id);

    try {
      const response = await fetch(`/api/admin/calculator-options/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setOptions((current) => current.filter((item) => item.id !== id));
      setAdminOk(true);
      setAdminMessage(locale === "uk" ? "Опцію видалено." : "Опция удалена.");
    } catch {
      setAdminOk(false);
      setAdminMessage(locale === "uk" ? "Не вдалося видалити опцію." : "Не удалось удалить опцию.");
    } finally {
      setBusyOptionId(null);
    }
  }

  function updateOption(id: string, patch: Partial<CalculatorOptionRecord>) {
    setOptions((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function renderRadioList(
    title: string,
    items: CalculatorOptionRecord[],
    selected: string,
    onChange: (value: string) => void,
    mode: "default" | "color" = "default",
  ) {
    return (
      <div className="grid gap-3">
        <h4 className="text-sm font-semibold text-[var(--text)]">{title}</h4>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/60 px-4 py-5 text-sm text-[var(--text-muted)]">
            {t.noOptions}
          </div>
        ) : (
          <div className="grid gap-2">
            {items.map((item) => {
              const isSelected = selected === item.key;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange(item.key)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-[var(--brand)] bg-[rgba(47,122,87,0.08)] shadow-[0_16px_30px_rgba(47,122,87,0.12)]"
                      : "border-[var(--line)] bg-white/82 hover:border-[rgba(47,122,87,0.28)] hover:bg-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {mode === "color" ? (
                      <span
                        className="h-5 w-5 rounded-full border border-black/10 shadow-inner"
                        style={{ background: colorSwatches[item.key] ?? "#dfe8e2" }}
                      />
                    ) : null}
                    <span className="text-sm font-medium text-[var(--text)]">
                      {getOptionLabel(item, locale)}
                    </span>
                  </span>
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full border ${
                      isSelected
                        ? "border-[var(--brand)] bg-[var(--brand)]"
                        : "border-[rgba(73,111,94,0.24)] bg-transparent"
                    }`}
                  >
                    <span
                      className={`block h-2.5 w-2.5 rounded-full bg-white transition ${
                        isSelected ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <section className="glass-panel-enhanced rounded-[2rem] p-6 sm:p-8 xl:p-10">
        <div className="grid gap-8 xl:grid-cols-[0.88fr_1.02fr_0.9fr]">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <span className="inline-flex w-fit rounded-full border border-[rgba(47,122,87,0.18)] bg-white/80 px-4 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[var(--brand)]">
                {t.title}
              </span>
              <h1 className="max-w-[10ch] text-4xl font-semibold leading-[0.95] text-[var(--text)] sm:text-5xl xl:text-[4.2rem]">
                {locale === "uk"
                  ? "Підбір вікон, дверей та сонцезахисту"
                  : "Подбор окон, дверей и солнцезащиты"}
              </h1>
              <p className="max-w-[56ch] text-base leading-8 text-[var(--text-muted)]">{t.subtitle}</p>
            </div>

            <div className="grid gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
                {t.groupTitle}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(t.productGroups) as ProductGroup[]).map((group) => {
                  const isSelected = group === selectedGroup;
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setSelectedGroup(group)}
                      className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                        isSelected
                          ? "border-[var(--brand)] bg-[rgba(47,122,87,0.08)] shadow-[0_16px_32px_rgba(47,122,87,0.16)]"
                          : "border-[var(--line)] bg-white/78 hover:border-[rgba(47,122,87,0.2)] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-base font-semibold text-[var(--text)]">
                          {t.productGroups[group]}
                        </span>
                        <ArrowIcon className={`h-4 w-4 ${isSelected ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
                {t.exampleTitle}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleConstructions.map((item) => {
                  const isActive = item.key === selectedConstruction?.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedConstructionKey(item.key)}
                      className={`rounded-[1.6rem] border p-4 text-left transition ${
                        isActive
                          ? "border-[var(--brand)] bg-[rgba(47,122,87,0.08)] shadow-[0_18px_32px_rgba(47,122,87,0.16)]"
                          : "border-[var(--line)] bg-white/74 hover:border-[rgba(47,122,87,0.22)] hover:bg-white"
                      }`}
                    >
                      <div className="mb-3 overflow-hidden rounded-[1.2rem] border border-[rgba(73,111,94,0.1)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(233,243,236,0.92))] p-2">
                        <div className="mx-auto h-32 max-w-[12rem]">
                          <ConstructionPreview
                            construction={item}
                            width={item.defaultWidth}
                            height={item.defaultHeight}
                            openingType={item.supportsOpening ? "turn" : "fixed"}
                            openingSide="right"
                            colorKey={selectedColor || "white"}
                          />
                        </div>
                      </div>
                      <div className="grid gap-1">
                        <h3 className="text-base font-semibold text-[var(--text)]">
                          {getConstructionLabel(item, locale)}
                        </h3>
                        <p className="text-sm leading-6 text-[var(--text-muted)]">
                          {getConstructionDescription(item, locale)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
                  {t.previewTitle}
                </span>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                  {selectedConstruction ? getConstructionLabel(selectedConstruction, locale) : ""}
                </h2>
              </div>
              <div className="rounded-full border border-[rgba(47,122,87,0.18)] bg-white/80 px-4 py-2 text-sm text-[var(--brand)]">
                {t.resultReady}
              </div>
            </div>

            <div
              ref={previewRef}
              className="relative overflow-hidden rounded-[2rem] border border-[rgba(73,111,94,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(233,243,236,0.82))] p-4 shadow-[0_28px_60px_rgba(34,54,45,0.08)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_50%)]" />
              {selectedConstruction ? (
                <div className="relative mx-auto max-w-[28rem]">
                  <ConstructionPreview
                    construction={selectedConstruction}
                    width={width}
                    height={height}
                    openingType={selectedOpeningType || "fixed"}
                    openingSide={selectedOpeningSide}
                    colorKey={selectedColor || "white"}
                  />
                </div>
              ) : null}
            </div>

            <div className="rounded-[1.8rem] border border-[rgba(73,111,94,0.12)] bg-white/84 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">{t.dimensionsTitle}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{t.summaryHint}</p>
                </div>
                <div className="rounded-full bg-[rgba(47,122,87,0.08)] px-3 py-2 text-sm font-medium text-[var(--brand)]">
                  {selectedConstruction ? getConstructionLabel(selectedConstruction, locale) : ""}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
                  {t.width}
                  <div className="relative">
                    <input
                      type="number"
                      min={300}
                      max={6000}
                      value={width}
                      onChange={(event) => setWidth(Number(event.target.value))}
                      className="input-shell pr-16"
                    />
                    <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                      {t.mm}
                    </span>
                  </div>
                </label>
                <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
                  {t.height}
                  <div className="relative">
                    <input
                      type="number"
                      min={300}
                      max={6000}
                      value={height}
                      onChange={(event) => setHeight(Number(event.target.value))}
                      className="input-shell pr-16"
                    />
                    <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                      {t.mm}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[1.8rem] border border-[rgba(73,111,94,0.12)] bg-white/84 p-5">
              <h2 className="mb-5 text-2xl font-semibold text-[var(--text)]">{t.optionsTitle}</h2>
              <div className="grid gap-5">
                {renderRadioList(t.profileBrand, activeOptions.profileBrand, selectedProfileBrand, setSelectedProfileBrand)}
                {renderRadioList(t.profileSystem, activeOptions.profileSystem, selectedProfileSystem, setSelectedProfileSystem)}
                {selectedConstruction?.supportsGlass
                  ? renderRadioList(t.glassPackage, activeOptions.glassPackage, selectedGlassPackage, setSelectedGlassPackage)
                  : null}
                {selectedConstruction?.supportsOpening
                  ? renderRadioList(t.openingType, openingOptions, selectedOpeningType, setSelectedOpeningType)
                  : null}
                {selectedConstruction?.supportsOpening && selectedOpeningType && selectedOpeningType !== "fixed" ? (
                  <div className="grid gap-3">
                    <h4 className="text-sm font-semibold text-[var(--text)]">{t.openingSide}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {(["left", "right"] as OpeningSide[]).map((side) => {
                        const active = side === selectedOpeningSide;
                        return (
                          <button
                            key={side}
                            type="button"
                            onClick={() => setSelectedOpeningSide(side)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                              active
                                ? "border-[var(--brand)] bg-[rgba(47,122,87,0.08)] text-[var(--brand)]"
                                : "border-[var(--line)] bg-white text-[var(--text-muted)] hover:border-[rgba(47,122,87,0.22)]"
                            }`}
                          >
                            {side === "left" ? t.left : t.right}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {renderRadioList(t.color, activeOptions.color, selectedColor, setSelectedColor, "color")}
                <div className="grid gap-3">
                  <h4 className="text-sm font-semibold text-[var(--text)]">{t.addons}</h4>
                  {activeOptions.addon.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/60 px-4 py-5 text-sm text-[var(--text-muted)]">
                      {t.noOptions}
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {activeOptions.addon.map((item) => {
                        const checked = selectedAddons.includes(item.key);
                        return (
                          <label
                            key={item.id}
                            className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${
                              checked
                                ? "border-[var(--brand)] bg-[rgba(47,122,87,0.08)]"
                                : "border-[var(--line)] bg-white hover:border-[rgba(47,122,87,0.2)]"
                            }`}
                          >
                            <span className="text-sm font-medium text-[var(--text)]">
                              {getOptionLabel(item, locale)}
                            </span>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAddon(item.key)}
                              className="h-4 w-4 accent-[var(--brand)]"
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              ref={priceRef}
              className="rounded-[1.8rem] border border-[rgba(47,122,87,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(223,237,229,0.86))] p-5 shadow-[0_24px_50px_rgba(34,54,45,0.08)]"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">{t.estimate}</p>
                  <div className="mt-3 text-3xl font-semibold text-[var(--text)]">
                    {formatMoney(estimate.estimateMin)} - {formatMoney(estimate.estimateMax)} грн
                  </div>
                  <p className="mt-3 max-w-[34ch] text-sm leading-6 text-[var(--text-muted)]">{t.estimateHint}</p>
                </div>
                <div className="rounded-full bg-white/88 px-4 py-2 text-sm font-medium text-[var(--brand)]">
                  {width} x {height} {t.mm}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-[rgba(47,122,87,0.16)] bg-white/86 px-3 py-2 text-sm text-[var(--text)]">
                  {selectedConstruction ? getConstructionLabel(selectedConstruction, locale) : ""}
                </span>
                {selectedProfileBrand ? (
                  <span className="rounded-full border border-[rgba(47,122,87,0.16)] bg-white/86 px-3 py-2 text-sm text-[var(--text)]">
                    {activeOptions.profileBrand.find((item) => item.key === selectedProfileBrand)
                      ? getOptionLabel(
                          activeOptions.profileBrand.find((item) => item.key === selectedProfileBrand)!,
                          locale,
                        )
                      : selectedProfileBrand}
                  </span>
                ) : null}
                {selectedProfileSystem ? (
                  <span className="rounded-full border border-[rgba(47,122,87,0.16)] bg-white/86 px-3 py-2 text-sm text-[var(--text)]">
                    {activeOptions.profileSystem.find((item) => item.key === selectedProfileSystem)
                      ? getOptionLabel(
                          activeOptions.profileSystem.find((item) => item.key === selectedProfileSystem)!,
                          locale,
                        )
                      : selectedProfileSystem}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="glass-panel-enhanced rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <span className="inline-flex rounded-full border border-[rgba(47,122,87,0.18)] bg-white/80 px-4 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[var(--brand)]">
                {t.summary}
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-[var(--text)]">
                {locale === "uk" ? "Конфігурація для менеджера" : "Конфигурация для менеджера"}
              </h2>
              <p className="mt-2 max-w-[56ch] text-sm leading-7 text-[var(--text-muted)]">{t.summaryHint}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                label: t.groupTitle,
                value: t.productGroups[selectedGroup],
              },
              {
                label: t.exampleTitle,
                value: selectedConstruction ? getConstructionLabel(selectedConstruction, locale) : "",
              },
              {
                label: t.profileBrand,
                value:
                  activeOptions.profileBrand.find((item) => item.key === selectedProfileBrand)
                    ? getOptionLabel(
                        activeOptions.profileBrand.find((item) => item.key === selectedProfileBrand)!,
                        locale,
                      )
                    : "—",
              },
              {
                label: t.profileSystem,
                value:
                  activeOptions.profileSystem.find((item) => item.key === selectedProfileSystem)
                    ? getOptionLabel(
                        activeOptions.profileSystem.find((item) => item.key === selectedProfileSystem)!,
                        locale,
                      )
                    : "—",
              },
              {
                label: t.glassPackage,
                value:
                  selectedConstruction?.supportsGlass &&
                  activeOptions.glassPackage.find((item) => item.key === selectedGlassPackage)
                    ? getOptionLabel(
                        activeOptions.glassPackage.find((item) => item.key === selectedGlassPackage)!,
                        locale,
                      )
                    : "—",
              },
              {
                label: t.color,
                value:
                  activeOptions.color.find((item) => item.key === selectedColor)
                    ? getOptionLabel(activeOptions.color.find((item) => item.key === selectedColor)!, locale)
                    : "—",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-[rgba(73,111,94,0.1)] bg-white/82 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{item.label}</p>
                <p className="mt-3 text-base font-semibold text-[var(--text)]">{item.value || "—"}</p>
              </div>
            ))}
          </div>

          {selectedAddons.length > 0 ? (
            <div className="mt-4 rounded-[1.5rem] border border-[rgba(73,111,94,0.1)] bg-white/82 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{t.addons}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedAddons.map((key) => {
                  const option = activeOptions.addon.find((item) => item.key === key);
                  return option ? (
                    <span key={key} className="rounded-full bg-[rgba(47,122,87,0.08)] px-3 py-2 text-sm text-[var(--brand)]">
                      {getOptionLabel(option, locale)}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="glass-panel-enhanced rounded-[2rem] p-6 sm:p-8">
          <span className="inline-flex rounded-full border border-[rgba(47,122,87,0.18)] bg-white/80 px-4 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[var(--brand)]">
            {t.contactTitle}
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--text)]">
            {locale === "uk" ? "Швидка заявка на розрахунок" : "Быстрая заявка на расчёт"}
          </h2>
          <p className="mt-2 max-w-[48ch] text-sm leading-7 text-[var(--text-muted)]">
            {locale === "uk"
              ? "Менеджер отримає конфігурацію, параметри розміру та контактні дані, щоб швидко зорієнтувати вас по вартості та строках."
              : "Менеджер получит конфигурацию, параметры размера и контактные данные, чтобы быстро сориентировать вас по стоимости и срокам."}
          </p>

          <form className="mt-6 grid gap-4" onSubmit={submitLead}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
                {t.name}
                <input value={name} onChange={(event) => setName(event.target.value)} required className="input-shell" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
                {t.phone}
                <input value={phone} onChange={(event) => setPhone(event.target.value)} required className="input-shell" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
              {t.comment}
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                className="input-shell resize-none"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-shimmer rounded-2xl bg-[var(--brand)] px-5 py-4 text-base font-semibold text-white transition hover:bg-[var(--brand-strong)] hover:shadow-[0_18px_30px_rgba(47,122,87,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t.loading : t.submit}
            </button>

            {leadMessage ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  leadOk
                    ? "border-[rgba(47,122,87,0.16)] bg-[rgba(47,122,87,0.08)] text-[var(--brand)]"
                    : "border-[rgba(194,82,82,0.18)] bg-[rgba(194,82,82,0.08)] text-[#b14545]"
                }`}
              >
                {leadMessage}
              </div>
            ) : null}
          </form>
        </div>
      </section>

      {isAdmin ? (
        <section className="glass-panel-enhanced rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-3 border-b border-[rgba(73,111,94,0.12)] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-[rgba(47,122,87,0.18)] bg-white/80 px-4 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[var(--brand)]">
                {t.adminTitle}
              </span>
              <h2 className="mt-3 text-3xl font-semibold text-[var(--text)]">{t.adminTitle}</h2>
              <p className="mt-2 max-w-[64ch] text-sm leading-7 text-[var(--text-muted)]">{t.adminSubtitle}</p>
            </div>
            {adminMessage ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  adminOk
                    ? "border-[rgba(47,122,87,0.16)] bg-[rgba(47,122,87,0.08)] text-[var(--brand)]"
                    : "border-[rgba(194,82,82,0.18)] bg-[rgba(194,82,82,0.08)] text-[#b14545]"
                }`}
              >
                {adminMessage}
              </div>
            ) : null}
          </div>

          <form onSubmit={createOption} className="mt-6 grid gap-4 rounded-[1.8rem] border border-[rgba(73,111,94,0.1)] bg-white/82 p-5">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
                {t.type}
                <select
                  value={createDraft.type}
                  onChange={(event) =>
                    setCreateDraft((current) => ({
                      ...current,
                      type: event.target.value as CalculatorOptionType,
                    }))
                  }
                  className="input-shell"
                >
                  {optionTypeOrder.map((type) => (
                    <option key={type} value={type}>
                      {t.optionGroups[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
                {t.key}
                <input
                  value={createDraft.key}
                  onChange={(event) => setCreateDraft((current) => ({ ...current, key: event.target.value }))}
                  className="input-shell"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
                {t.multiplier}
                <input
                  type="number"
                  min="0.5"
                  max="2.5"
                  step="0.01"
                  value={createDraft.multiplier}
                  onChange={(event) =>
                    setCreateDraft((current) => ({ ...current, multiplier: event.target.value }))
                  }
                  className="input-shell"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
                {t.labelRu}
                <input
                  value={createDraft.labelRu}
                  onChange={(event) => setCreateDraft((current) => ({ ...current, labelRu: event.target.value }))}
                  className="input-shell"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
                {t.labelUk}
                <input
                  value={createDraft.labelUk}
                  onChange={(event) => setCreateDraft((current) => ({ ...current, labelUk: event.target.value }))}
                  className="input-shell"
                />
              </label>
            </div>

            <label className="inline-flex items-center gap-3 text-sm font-medium text-[var(--text)]">
              <input
                type="checkbox"
                checked={createDraft.isActive}
                onChange={(event) =>
                  setCreateDraft((current) => ({ ...current, isActive: event.target.checked }))
                }
                className="h-4 w-4 accent-[var(--brand)]"
              />
              {t.active}
            </label>

            <button
              type="submit"
              disabled={busyOptionId === "create"}
              className="w-full rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
            >
              {t.createOption}
            </button>
          </form>

          <div className="mt-6 grid gap-6">
            {groupedOptionsForAdmin.map((group) => (
              <div
                key={group.type}
                className="rounded-[1.8rem] border border-[rgba(73,111,94,0.1)] bg-white/82 p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-[var(--text)]">{t.optionGroups[group.type]}</h3>
                  <span className="rounded-full bg-[rgba(47,122,87,0.08)] px-3 py-1 text-sm text-[var(--brand)]">
                    {group.items.length}
                  </span>
                </div>

                <div className="grid gap-4">
                  {group.items.map((option) => (
                    <div
                      key={option.id}
                      className="grid gap-4 rounded-[1.4rem] border border-[rgba(73,111,94,0.08)] bg-[rgba(255,255,255,0.72)] p-4"
                    >
                      <div className="grid gap-4 lg:grid-cols-[1.2fr_1.2fr_0.7fr_0.6fr]">
                        <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
                          {t.labelRu}
                          <input
                            value={option.labelRu}
                            onChange={(event) => updateOption(option.id, { labelRu: event.target.value })}
                            className="input-shell"
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
                          {t.labelUk}
                          <input
                            value={option.labelUk}
                            onChange={(event) => updateOption(option.id, { labelUk: event.target.value })}
                            className="input-shell"
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
                          {t.multiplier}
                          <input
                            type="number"
                            min="0.5"
                            max="2.5"
                            step="0.01"
                            value={option.multiplier}
                            onChange={(event) =>
                              updateOption(option.id, { multiplier: Number(event.target.value) })
                            }
                            className="input-shell"
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-medium text-[var(--text)]">
                          {t.key}
                          <input
                            value={option.key}
                            onChange={(event) => updateOption(option.id, { key: event.target.value })}
                            className="input-shell"
                          />
                        </label>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="inline-flex items-center gap-3 text-sm font-medium text-[var(--text)]">
                          <input
                            type="checkbox"
                            checked={option.isActive}
                            onChange={(event) =>
                              updateOption(option.id, { isActive: event.target.checked })
                            }
                            className="h-4 w-4 accent-[var(--brand)]"
                          />
                          {t.active}
                        </label>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busyOptionId === option.id}
                            onClick={() => saveOption(option)}
                            className="rounded-2xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
                          >
                            {t.save}
                          </button>
                          <button
                            type="button"
                            disabled={busyOptionId === option.id}
                            onClick={() => deleteOption(option.id)}
                            className="rounded-2xl border border-[rgba(194,82,82,0.22)] px-4 py-2 text-sm font-semibold text-[#b14545] transition hover:bg-[rgba(194,82,82,0.08)] disabled:opacity-60"
                          >
                            {t.delete}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
