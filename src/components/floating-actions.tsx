"use client";

import { useEffect, useState } from "react";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const TELEGRAM_LINK = "https://t.me/+380505496132";
const VIBER_LINK = "viber://chat?number=%2B380505496132";

const labels = {
  ru: {
    telegram: "Telegram",
    viber: "Viber-чат",
    top: "Наверх",
  },
  uk: {
    telegram: "Telegram",
    viber: "Viber-чат",
    top: "Вгору",
  },
};

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M21.5 4.5 18.4 19c-.2 1-.8 1.3-1.7.8l-4.7-3.4-2.3 2.2c-.3.3-.5.5-1 .5l.4-4.8 8.8-7.9c.4-.3-.1-.5-.6-.2L6.4 13 1.8 11.6c-1-.3-1-.9.2-1.3L20 3.4c.9-.3 1.7.2 1.5 1.1Z" />
    </svg>
  );
}

function ViberIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M12 2C6.7 2 3 5.4 3 10.3c0 2.8 1.2 4.7 3.3 6.1V22l4.1-2.2c.5.1 1 .1 1.6.1 5.3 0 9-3.4 9-8.3S17.3 2 12 2Zm4.2 11.2c-.2.6-.9 1-1.5 1.1-.4.1-.9.1-1.5 0-.4-.1-.9-.3-1.5-.6-2.4-1.1-4-3.7-4.1-3.8-.1-.2-1-1.3-1-2.5s.6-1.8.9-2.1c.2-.2.6-.3.9-.3h.7c.2 0 .5 0 .7.6.2.7.8 2.2.9 2.4.1.2.1.4 0 .6-.1.2-.2.4-.4.5-.2.2-.4.4-.5.5-.2.2-.3.4-.1.8.2.4 1 1.6 2.2 2.5 1.5 1.2 2.7 1.5 3.1 1.7.4.2.6.1.8-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.3.1 2 .9 2.3 1 .3.2.5.2.5.4 0 .3-.3 1-.5 1.6Z" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 14 6-6 6 6" />
    </svg>
  );
}

export function FloatingActions({ locale }: Props) {
  const [showTop, setShowTop] = useState(false);
  const t = labels[locale];

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 320);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="fixed right-3 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-5 sm:bottom-5">
      <a
        href={TELEGRAM_LINK}
        target="_blank"
        rel="noreferrer"
        className="floating-action group bg-[#2AABEE] text-white"
        aria-label={t.telegram}
      >
        <span className="floating-action__icon">
          <TelegramIcon />
        </span>
        <span className="floating-action__label">{t.telegram}</span>
      </a>

      <a
        href={VIBER_LINK}
        className="floating-action group bg-[#7D4AA8] text-white"
        aria-label={t.viber}
      >
        <span className="floating-action__icon">
          <ViberIcon />
        </span>
        <span className="floating-action__label">{t.viber}</span>
      </a>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label={t.top}
        className={`grid h-14 w-14 place-items-center rounded-full bg-[rgba(87,87,87,0.9)] text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-[rgba(61,61,61,0.96)] ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ArrowUpIcon />
      </button>
    </div>
  );
}
