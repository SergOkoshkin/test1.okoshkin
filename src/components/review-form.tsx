"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Locale } from "@/lib/i18n";
import gsap from "gsap";

type Props = {
  locale: Locale;
};

const text = {
  ru: {
    title: "Оставить отзыв",
    intro: "Расскажите, как прошёл монтаж, что понравилось в изделии и как показала себя установка.",
    name: "Имя",
    body: "Комментарий",
    rating: "Оценка",
    photo: "Фото работы (необязательно)",
    photoHint: "JPG/PNG/WebP, до 8 МБ",
    submit: "Отправить отзыв",
    loading: "Отправляем...",
    ok: "Спасибо! Отзыв отправлен на модерацию.",
    fail: "Не удалось отправить отзыв.",
  },
  uk: {
    title: "Залишити відгук",
    intro: "Розкажіть, як пройшов монтаж, що сподобалося у виробі та як показала себе установка.",
    name: "Ім'я",
    body: "Коментар",
    rating: "Оцінка",
    photo: "Фото роботи (необов'язково)",
    photoHint: "JPG/PNG/WebP, до 8 МБ",
    submit: "Надіслати відгук",
    loading: "Надсилаємо...",
    ok: "Дякуємо! Відгук відправлено на модерацію.",
    fail: "Не вдалося надіслати відгук.",
  },
};

export function ReviewForm({ locale }: Props) {
  const t = text[locale];
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean>(false);
  const messageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (messageRef.current && message) {
      gsap.fromTo(
        messageRef.current,
        { opacity: 0, y: 15, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
      );
    }
  }, [message]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/comments", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as { ok: boolean; message?: string };
    setLoading(false);
    setOk(Boolean(data.ok));
    setMessage(data.message ?? (data.ok ? t.ok : t.fail));

    if (data.ok) {
      form.reset();
    }
  }

  function handleInputFocus(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    gsap.to(event.target, {
      scale: 1.02,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  function handleInputBlur(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    gsap.to(event.target, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  return (
    <section className="glass-panel-enhanced rounded-[2rem] p-6 sm:p-7">
      <div className="max-w-md">
        <span className="section-kicker">{locale === "uk" ? "Відгуки" : "Отзывы"}</span>
        <h3 className="mt-4 font-[var(--font-display)] text-[1.9rem] font-semibold leading-none tracking-[-0.04em] transition-colors duration-300 hover:text-[var(--brand)]">
          {t.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{t.intro}</p>
      </div>

      <form className="mt-6 grid gap-3.5" onSubmit={onSubmit}>
        <input
          required
          name="name"
          placeholder={t.name}
          className="input-shell"
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        <textarea
          required
          name="body"
          rows={4}
          placeholder={t.body}
          className="input-shell min-h-[136px] resize-none"
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />

        <div className="grid gap-3.5 sm:grid-cols-[0.78fr_1.22fr] sm:items-start">
          <label className="grid gap-2 text-sm text-[var(--text-main)]">
            <span className="font-medium">{t.rating}</span>
            <select
              name="rating"
              defaultValue={5}
              className="input-shell min-h-[62px]"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} / 5
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-[var(--text-main)]">
            <span className="font-medium">{t.photo}</span>
            <div className="rounded-[1.15rem] border border-[var(--line-soft)] bg-white/86 px-3 py-3">
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="input-shell min-h-[62px] border-0 bg-transparent px-0 py-0 shadow-none file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand-soft)] file:px-3 file:py-1.5 file:font-medium file:text-[var(--brand)] file:transition-all file:duration-300 file:hover:bg-[var(--brand)] file:hover:text-white focus:shadow-none"
              />
              <span className="mt-2 block text-xs text-[var(--text-muted)]">{t.photoHint}</span>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-shimmer mt-1 rounded-[1.2rem] bg-[linear-gradient(135deg,var(--brand),var(--brand-strong))] px-5 py-3.5 font-semibold text-white shadow-[0_18px_30px_rgba(47,122,87,0.22)] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_24px_40px_rgba(47,122,87,0.28)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t.loading}
            </span>
          ) : (
            t.submit
          )}
        </button>
      </form>

      {message && (
        <p
          ref={messageRef}
          className={`mt-4 rounded-[1.1rem] border px-4 py-3 text-sm ${
            ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}
