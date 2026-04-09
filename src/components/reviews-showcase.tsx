"use client";

import { useEffect, useState } from "react";
import { Locale } from "@/lib/i18n";

type ReviewItem = {
  id: string;
  name: string;
  body: string;
  rating: number;
  photoUrl: string | null;
};

type Props = {
  locale: Locale;
  leadTitle: string;
  leadBody: string;
  emptyText: string;
  items: ReviewItem[];
};

const copy = {
  ru: {
    close: "Закрыть",
    slide: "Фото",
    openPhoto: "Открыть фото отзыва",
  },
  uk: {
    close: "Закрити",
    slide: "Фото",
    openPhoto: "Відкрити фото відгуку",
  },
} as const;

export function ReviewsShowcase({ locale, leadTitle, leadBody, emptyText, items }: Props) {
  const t = copy[locale];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const photoItems = items.filter((item) => item.photoUrl);
  const activeItem = activeIndex === null ? null : photoItems[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => {
          if (current === null || photoItems.length === 0) return current;
          return (current + 1) % photoItems.length;
        });
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => {
          if (current === null || photoItems.length === 0) return current;
          return (current - 1 + photoItems.length) % photoItems.length;
        });
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, photoItems.length]);

  function openPhoto(id: string) {
    const index = photoItems.findIndex((item) => item.id === id);
    if (index >= 0) setActiveIndex(index);
  }

  function move(direction: -1 | 1) {
    setActiveIndex((current) => {
      if (current === null || photoItems.length === 0) return current;
      return (current + direction + photoItems.length) % photoItems.length;
    });
  }

  return (
    <>
      <div className="glass-panel-enhanced rounded-[2rem] p-5 sm:p-6">
        <div data-reveal className="mb-5 rounded-[1.5rem] border border-white/80 bg-white/84 p-4">
          <h3 className="font-[var(--font-display)] text-[1.4rem] font-semibold tracking-[-0.04em]">
            {leadTitle}
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{leadBody}</p>
        </div>

        <div className="grid max-h-[760px] gap-3 overflow-y-auto pr-1">
          {items.length === 0 && (
            <p className="rounded-[1.4rem] border border-[var(--line-soft)] bg-white/88 px-4 py-4 text-sm text-[var(--text-muted)]">
              {emptyText}
            </p>
          )}

          {items.map((item) => {
            const hasPhoto = Boolean(item.photoUrl);

            return (
              <article
                key={item.id}
                data-reveal
                className="group rounded-[1.6rem] border border-white/80 bg-white/90 p-4 shadow-[0_12px_26px_rgba(20,40,30,0.05)] transition-all duration-400 hover:shadow-[0_18px_36px_rgba(20,40,30,0.1)] hover:border-[var(--brand)]/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="text-base font-semibold">{item.name}</strong>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{item.body}</p>
                  </div>

                  <div className="mt-0.5 flex shrink-0 gap-1 text-[var(--brand)]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        className={`transition-all duration-300 ${
                          index < item.rating ? "scale-100 opacity-100" : "scale-90 opacity-20"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {hasPhoto && (
                  <button
                    type="button"
                    onClick={() => openPhoto(item.id)}
                    className="mt-4 block w-full overflow-hidden rounded-[1.2rem] border border-[var(--line-soft)] text-left transition-all duration-300 hover:border-[var(--brand)] hover:shadow-[0_16px_34px_rgba(20,40,30,0.08)]"
                    aria-label={`${t.openPhoto}: ${item.name}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.photoUrl!}
                      alt={locale === "uk" ? `Фото роботи: ${item.name}` : `Фото работы: ${item.name}`}
                      className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {activeItem?.photoUrl && (
        <div className="fixed inset-0 z-50 bg-[rgba(8,16,12,0.92)] backdrop-blur-lg">
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute inset-0"
            aria-label={t.close}
          />

          <div className="relative flex h-full items-center justify-center px-4 py-6 sm:px-8">
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-all duration-300 hover:bg-white/20 hover:scale-105 sm:right-8 sm:top-8"
            >
              {t.close}
            </button>

            {photoItems.length > 1 && (
              <button
                type="button"
                onClick={() => move(-1)}
                className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-3xl text-white backdrop-blur transition-all duration-300 hover:bg-white/20 hover:scale-110 sm:left-6"
                aria-label={t.openPhoto}
              >
                ‹
              </button>
            )}

            <div className="relative w-full max-w-5xl">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeItem.photoUrl}
                  alt={locale === "uk" ? `Фото роботи: ${activeItem.name}` : `Фото работы: ${activeItem.name}`}
                  className="max-h-[74vh] w-full object-contain"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-white">
                <div>
                  <h2 className="text-2xl font-semibold">{activeItem.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">{activeItem.body}</p>
                </div>

                <div className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/85">
                  {t.slide} {(activeIndex ?? 0) + 1} / {photoItems.length}
                </div>
              </div>
            </div>

            {photoItems.length > 1 && (
              <button
                type="button"
                onClick={() => move(1)}
                className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-3xl text-white backdrop-blur transition-all duration-300 hover:bg-white/20 hover:scale-110 sm:right-6"
                aria-label={t.openPhoto}
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
