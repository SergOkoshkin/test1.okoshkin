import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const copy = {
  ru: {
    badge: "Сценарий проекта",
    title: "Показываем, что произойдет после заявки, а не просто обещаем результат.",
    body: "Вместо декоративного макета здесь теперь собрана полезная схема: как быстро вы получите ориентир по цене, когда согласуется комплектация и как дойдете до монтажа без хаоса.",
    status: "На связи",
    steps: [
      {
        eyebrow: "Шаг 1",
        title: "Заявка и предварительный ориентир",
        body: "Уточняем тип изделия, размеры и формат объекта, чтобы сразу дать понятное направление по решению и бюджету.",
      },
      {
        eyebrow: "Шаг 2",
        title: "Замер и согласование комплектации",
        body: "Фиксируем размеры, профиль, стеклопакет, открывание, цвет и солнцезащиту под дом, квартиру или офис.",
      },
      {
        eyebrow: "Шаг 3",
        title: "Поставка, монтаж и финальная сдача",
        body: "Согласовываем сроки, выполняем установку и доводим объект до аккуратного результата без лишней суеты.",
      },
    ],
    facts: [
      { value: "Раздельная", label: "офис и живая консультация" },
      { value: "Telegram / Viber", label: "быстрая связь по заявке" },
      { value: "09:00–13:00", label: "рабочее время офиса" },
      { value: "Район + область", label: "выезд на замер по договорённости" },
    ],
    noteTitle: "Что клиент получает сразу",
    noteBody:
      "Понятный маршрут, ориентир по стоимости, подбор решения под задачу и контактный канал для быстрого продолжения разговора.",
  },
  uk: {
    badge: "Сценарій проєкту",
    title: "Показуємо, що відбувається після заявки, а не просто обіцяємо результат.",
    body: "Замість декоративного макета тут тепер зібрана корисна схема: як швидко ви отримаєте орієнтир по ціні, коли узгоджується комплектація та як доходите до монтажу без хаосу.",
    status: "На зв'язку",
    steps: [
      {
        eyebrow: "Крок 1",
        title: "Заявка та попередній орієнтир",
        body: "Уточнюємо тип виробу, розміри та формат об'єкта, щоб одразу дати зрозумілий напрямок по рішенню та бюджету.",
      },
      {
        eyebrow: "Крок 2",
        title: "Замір та узгодження комплектації",
        body: "Фіксуємо розміри, профіль, склопакет, відкривання, колір та сонцезахист під будинок, квартиру або офіс.",
      },
      {
        eyebrow: "Крок 3",
        title: "Поставка, монтаж і фінальна здача",
        body: "Узгоджуємо строки, виконуємо встановлення та доводимо об'єкт до акуратного результату без зайвої метушні.",
      },
    ],
    facts: [
      { value: "Роздільна", label: "офіс і жива консультація" },
      { value: "Telegram / Viber", label: "швидкий зв'язок по заявці" },
      { value: "09:00–13:00", label: "робочий час офісу" },
      { value: "Район + область", label: "виїзд на замір за домовленістю" },
    ],
    noteTitle: "Що клієнт отримує одразу",
    noteBody:
      "Зрозумілий маршрут, орієнтир по вартості, підбір рішення під задачу та контактний канал для швидкого продовження розмови.",
  },
} as const;

function PulseIcon() {
  return (
    <span className="hero-service-panel__pulse inline-flex h-2.5 w-2.5 rounded-full bg-[var(--brand)]" />
  );
}

function RouteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroServicePanel({ locale }: Props) {
  const t = copy[locale];

  return (
    <div data-reveal data-delay="0.11" className="relative">
      <div className="glass-panel hero-service-panel relative overflow-hidden rounded-[2.2rem] p-5 sm:p-6">
        <div className="hero-service-panel__shine" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="section-kicker">{t.badge}</span>
              <h2 className="mt-4 max-w-xl font-[var(--font-display)] text-[clamp(1.7rem,2.5vw,2.5rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--text-main)]">
                {t.title}
              </h2>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)] shadow-[0_10px_24px_rgba(20,40,30,0.06)]">
              <PulseIcon />
              {t.status}
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-muted)] sm:text-[0.98rem]">
            {t.body}
          </p>

          <div className="mt-6 rounded-[1.7rem] border border-white/84 bg-white/76 p-4 shadow-[0_14px_28px_rgba(20,40,30,0.05)]">
            <div className="hero-service-panel__route">
              <div className="hero-service-panel__route-line" />
              <div className="hero-service-panel__route-line hero-service-panel__route-line--active" />
              <div className="hero-service-panel__route-points">
                {t.steps.map((step, index) => (
                  <div key={step.title} className="hero-service-panel__route-point">
                    <span className="hero-service-panel__route-dot">{index + 1}</span>
                    <span className="hero-service-panel__route-label">{step.eyebrow}</span>
                  </div>
                ))}
              </div>
            </div>

            <div data-stagger className="mt-5 grid gap-3">
              {t.steps.map((step) => (
                <article
                  key={step.title}
                  className="rounded-[1.25rem] border border-[rgba(95,122,108,0.12)] bg-[rgba(255,255,255,0.86)] px-4 py-3 shadow-[0_10px_24px_rgba(20,40,30,0.04)] transition-all duration-300 hover:border-[rgba(47,122,87,0.22)] hover:shadow-[0_14px_32px_rgba(20,40,30,0.08)]"
                >
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
                    {step.eyebrow}
                  </p>
                  <div className="mt-2 flex items-start gap-3">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                      <RouteIcon />
                    </span>
                    <div>
                      <h3 className="font-medium text-[var(--text-main)]">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{step.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {t.facts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-[1.25rem] border border-white/82 bg-white/78 px-4 py-3 shadow-[0_10px_24px_rgba(20,40,30,0.04)]"
              >
                <p className="font-[var(--font-display)] text-[1.06rem] font-semibold tracking-[-0.03em] text-[var(--text-main)]">
                  {fact.value}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{fact.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/84 bg-[linear-gradient(135deg,rgba(47,122,87,0.08),rgba(255,255,255,0.9))] px-4 py-4 shadow-[0_12px_24px_rgba(20,40,30,0.04)]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
              {t.noteTitle}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{t.noteBody}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
