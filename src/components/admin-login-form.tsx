"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const labels = {
  ru: {
    title: "Вход администратора",
    subtitle: "Авторизация для обработки заявок, отзывов и галереи.",
    email: "Email",
    password: "Пароль",
    button: "Войти",
    loading: "Проверка...",
    error: "Неверный логин или пароль.",
    rateLimit: "Слишком много попыток. Повторите позже.",
  },
  uk: {
    title: "Вхід адміністратора",
    subtitle: "Авторизація для обробки заявок, відгуків і галереї.",
    email: "Email",
    password: "Пароль",
    button: "Увійти",
    loading: "Перевірка...",
    error: "Невірний логін або пароль.",
    rateLimit: "Забагато спроб. Спробуйте пізніше.",
  },
};

export function AdminLoginForm({ locale }: Props) {
  const t = labels[locale];
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      const message =
        result?.error && /too many/i.test(result.error) ? t.rateLimit : t.error;
      setError(message);
      return;
    }

    router.replace(`/${locale}/admin`);
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-[var(--line-soft)] bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-3xl font-semibold">{t.title}</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{t.subtitle}</p>
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        <label className="grid gap-2 text-sm">
          {t.email}
          <input
            required
            name="email"
            type="email"
            className="rounded-xl border border-[var(--line-soft)] px-4 py-2.5 outline-none focus:border-[var(--brand)]"
          />
        </label>
        <label className="grid gap-2 text-sm">
          {t.password}
          <input
            required
            name="password"
            type="password"
            className="rounded-xl border border-[var(--line-soft)] px-4 py-2.5 outline-none focus:border-[var(--brand)]"
          />
        </label>
        <button
          disabled={loading}
          type="submit"
          className="rounded-xl bg-[var(--brand)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--accent)] disabled:opacity-60"
        >
          {loading ? t.loading : t.button}
        </button>
      </form>
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
