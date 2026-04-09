"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Locale } from "@/lib/i18n";

type PreviewItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

type Props = {
  locale: Locale;
  items: PreviewItem[];
  kicker: string;
  title: string;
  body: string;
  viewAll: string;
  open: string;
  freshLabel: string;
  galleryLabel: string;
  closeLabel: string;
  slideLabel: string;
};

function ArrowUpRightIcon() {
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

export function LandingGalleryPreview({
  locale,
  items,
  kicker,
  title,
  body,
  viewAll,
  open,
  freshLabel,
  galleryLabel,
  closeLabel,
  slideLabel,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex === null ? null : items[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => {
          if (current === null || items.length === 0) return current;
          return (current + 1) % items.length;
        });
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => {
          if (current === null || items.length === 0) return current;
          return (current - 1 + items.length) % items.length;
        });
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, items.length]);

  function move(direction: -1 | 1) {
    setActiveIndex((current) => {
      if (current === null || items.length === 0) return current;
      return (current + direction + items.length) % items.length;
    });
  }

  if (items.length === 0) return null;

  return (
    <>
      <section id="gallery" className="container-site pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-4xl">
            <span data-reveal className="section-kicker">
              {kicker}
            </span>
            <h2 data-reveal className="section-title mt-5">
              {title}
            </h2>
            <p data-reveal className="section-copy mt-4">
              {body}
            </p>
          </div>

          <Link
            data-reveal
            href={`/${locale}/gallery`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-white/85 px-5 py-3 font-semibold text-[var(--text-main)] transition hover:border-[var(--brand)] hover:bg-white"
          >
            {viewAll}
            <ArrowUpRightIcon />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <article
            data-reveal
            data-tilt="4"
            className="group relative overflow-hidden rounded-[2rem] border border-white/80 bg-[#dfe8e1] shadow-[0_24px_50px_rgba(20,40,30,0.08)] transition-all duration-500 hover:shadow-[0_32px_64px_rgba(20,40,30,0.14)]"
          >
            <button
              type="button"
              onClick={() => setActiveIndex(0)}
              className="absolute inset-0 z-[1]"
              aria-label={`${open}: ${items[0].title}`}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={items[0].imageUrl}
              alt={items[0].title}
              className="aspect-[1.25/1] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
              loading="lazy"
            />

            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(15,31,23,0),rgba(15,31,23,0.82))] p-6 text-white transition-transform duration-500 group-hover:translate-y-[-4px]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/74">
                {freshLabel}
              </p>
              <h3 className="mt-2 font-[var(--font-display)] text-[1.6rem] font-semibold tracking-[-0.04em]">
                {items[0].title}
              </h3>
              {items[0].description && (
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/78">
                  {items[0].description}
                </p>
              )}
            </div>
          </article>

          <div className="grid gap-4">
            {items.slice(1).map((item, index) => (
              <article
                key={item.id}
                data-reveal
                data-tilt="5"
                className="group overflow-hidden rounded-[2rem] border border-white/80 bg-white/88 shadow-[0_18px_36px_rgba(20,40,30,0.06)] transition-all duration-500 hover:shadow-[0_24px_48px_rgba(20,40,30,0.12)] hover:border-[var(--brand)]/20"
              >
                <div className="grid gap-4 sm:grid-cols-[0.42fr_0.58fr]">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index + 1)}
                    className="relative overflow-hidden bg-[#dfe8e1]"
                    aria-label={`${open}: ${item.title}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full min-h-[200px] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.08]"
                      loading="lazy"
                    />
                  </button>

                  <div className="flex h-full flex-col justify-between p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
                        {galleryLabel}
                      </p>
                      <h3 className="mt-3 font-[var(--font-display)] text-[1.35rem] font-semibold tracking-[-0.04em] transition-colors duration-300 group-hover:text-[var(--brand)]">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{item.description}</p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveIndex(index + 1)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] transition-all duration-300 hover:gap-3"
                      >
                        {open}
                        <ArrowUpRightIcon />
                      </button>

                      <Link
                        href={`/${locale}/gallery`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] transition-all duration-300 hover:text-[var(--brand)]"
                      >
                        {viewAll}
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {activeItem && (
        <div className="fixed inset-0 z-50 bg-[rgba(8,16,12,0.92)] backdrop-blur-lg">
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute inset-0"
            aria-label={closeLabel}
          />

          <div className="relative flex h-full items-center justify-center px-4 py-6 sm:px-8">
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-all duration-300 hover:bg-white/20 hover:scale-105 sm:right-8 sm:top-8"
            >
              {closeLabel}
            </button>

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => move(-1)}
                className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-3xl text-white backdrop-blur transition-all duration-300 hover:bg-white/20 hover:scale-110 sm:left-6"
                aria-label={open}
              >
                ‹
              </button>
            )}

            <div className="relative w-full max-w-6xl">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  className="max-h-[74vh] w-full object-contain"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                    {galleryLabel}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">{activeItem.title}</h2>
                  {activeItem.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
                      {activeItem.description}
                    </p>
                  )}
                </div>

                <div className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/85">
                  {slideLabel} {(activeIndex ?? 0) + 1} / {items.length}
                </div>
              </div>
            </div>

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => move(1)}
                className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-3xl text-white backdrop-blur transition-all duration-300 hover:bg-white/20 hover:scale-110 sm:right-6"
                aria-label={open}
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
