export const SUPPORTED_LOCALES = ["ru", "uk"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

type Dictionary = {
  nav: {
    home: string;
    calculator: string;
    admin: string;
    contacts: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaMain: string;
    ctaAlt: string;
  };
  servicesTitle: string;
  services: string[];
  advantagesTitle: string;
  advantages: string[];
  galleryTitle: string;
  reviewsTitle: string;
  mapTitle: string;
  officeHours: string;
  footer: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    nav: {
      home: "Главная",
      calculator: "Калькулятор",
      admin: "Админка",
      contacts: "Контакты",
    },
    hero: {
      title: "Пластиковые окна, двери, ролеты и жалюзи в Раздельной",
      subtitle:
        "Продажа, доставка и установка под ключ. Работаем по г. Раздельная, Раздельнянскому району и Одесской области.",
      ctaMain: "Рассчитать стоимость",
      ctaAlt: "Связаться с нами",
    },
    servicesTitle: "Услуги",
    services: [
      "Пластиковые окна (ПВХ)",
      "Входные и межкомнатные двери",
      "Ролеты на окна и двери",
      "Жалюзи и солнцезащита",
    ],
    advantagesTitle: "Почему выбирают нас",
    advantages: [
      "Быстрый выезд и замер",
      "Честный предварительный расчет",
      "Монтаж с гарантией качества",
      "Подбор решения под бюджет клиента",
    ],
    galleryTitle: "Последние работы и товары",
    reviewsTitle: "Отзывы клиентов",
    mapTitle: "Где находится офис",
    officeHours: "График работы офиса: 09:00 - 13:00",
    footer: "Окна и Двери Раздельная. Все права защищены.",
  },
  uk: {
    nav: {
      home: "Головна",
      calculator: "Калькулятор",
      admin: "Адмінка",
      contacts: "Контакти",
    },
    hero: {
      title: "Пластикові вікна, двері, ролети та жалюзі у Роздільній",
      subtitle:
        "Продаж, доставка та монтаж під ключ. Працюємо по м. Роздільна, Роздільнянському району та Одеській області.",
      ctaMain: "Розрахувати вартість",
      ctaAlt: "Зв'язатися з нами",
    },
    servicesTitle: "Послуги",
    services: [
      "Пластикові вікна (ПВХ)",
      "Вхідні та міжкімнатні двері",
      "Ролети на вікна та двері",
      "Жалюзі та сонцезахист",
    ],
    advantagesTitle: "Чому обирають нас",
    advantages: [
      "Швидкий виїзд і замір",
      "Чесний попередній розрахунок",
      "Монтаж із гарантією якості",
      "Підбір рішення під бюджет клієнта",
    ],
    galleryTitle: "Останні роботи та товари",
    reviewsTitle: "Відгуки клієнтів",
    mapTitle: "Де знаходиться офіс",
    officeHours: "Графік роботи офісу: 09:00 - 13:00",
    footer: "Вікна та Двері Роздільна. Усі права захищені.",
  },
};

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function detectLocaleByHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return "ru";

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tagRaw, ...params] = part.trim().toLowerCase().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const q = qParam ? Number(qParam.split("=")[1]) : 1;
      return {
        tag: tagRaw,
        q: Number.isFinite(q) ? q : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const item of ranked) {
    if (item.tag.startsWith("ru")) return "ru";
    if (item.tag.startsWith("uk")) return "uk";
  }

  return "ru";
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
