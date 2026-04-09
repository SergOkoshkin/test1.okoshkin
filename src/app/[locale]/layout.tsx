import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { Locale, SUPPORTED_LOCALES, getDictionary, isLocale } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BrandLogo } from "@/components/brand-logo";
import { FloatingActions } from "@/components/floating-actions";
import { authOptions } from "@/lib/auth-options";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const contacts = {
  phones: ["+38 (050) 549 61 32", "+38 (067) 896 54 00"],
  telegram: "Telegram",
  viber: "Viber",
  hours: {
    ru: "Офис: 09:00–13:00",
    uk: "Офіс: 09:00–13:00",
  },
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale as Locale);
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean(session?.user?.role === "admin");

  const navItems =
    locale === "uk"
      ? [
          { href: `/${locale}`, label: "Головна" },
          { href: `/${locale}#solutions`, label: "Рішення" },
          { href: `/${locale}/calculator`, label: "Калькулятор" },
          { href: `/${locale}#gallery`, label: "Галерея" },
          { href: `/${locale}#contacts`, label: "Контакти" },
        ]
      : [
          { href: `/${locale}`, label: "Главная" },
          { href: `/${locale}#solutions`, label: "Решения" },
          { href: `/${locale}/calculator`, label: "Калькулятор" },
          { href: `/${locale}#gallery`, label: "Галерея" },
          { href: `/${locale}#contacts`, label: "Контакты" },
        ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 px-2 pt-2 sm:px-3">
        <div className="container-site">
          <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[1.55rem] px-4 py-3 sm:px-5">
            <Link href={`/${locale}`} className="shrink-0">
              <BrandLogo locale={locale as Locale} />
            </Link>

            <div className="flex flex-wrap items-center justify-end gap-2.5">
              <nav className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/78 px-2 py-1 text-sm text-[var(--text-muted)] lg:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-3 py-2 transition hover:bg-white hover:text-[var(--text-main)]"
                  >
                    {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href={`/${locale}/admin`}
                    className="rounded-full bg-[var(--brand-soft)] px-3 py-2 font-medium text-[var(--brand)] transition hover:bg-[var(--brand)] hover:text-white"
                  >
                    {t.nav.admin}
                  </Link>
                )}
              </nav>

              <LanguageSwitcher locale={locale as Locale} />
            </div>
          </div>
        </div>
      </header>

      {children}

      <FloatingActions locale={locale as Locale} />

      <footer className="mt-14 pb-5 sm:pb-6">
        <div className="container-site">
          <div className="overflow-hidden rounded-[1.9rem] border border-[#274636] bg-[linear-gradient(145deg,#183126,#234337)] px-5 py-6 text-white shadow-[0_26px_64px_rgba(20,40,30,0.2)] sm:px-6 sm:py-7">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr_0.7fr]">
              <div>
                <p className="font-[var(--font-display)] text-[1.45rem] font-semibold tracking-[-0.04em] text-white">
                  Okoshkin
                </p>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/74">
                  {locale === "uk"
                    ? "Продаж і встановлення вікон, дверей, ролет і жалюзі в Роздільній, по району та об'єктах в Одеській області."
                    : "Продажа и установка окон, дверей, роллет и жалюзи в Раздельной, по району и объектам в Одесской области."}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/48">
                  {t.footer}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9fceb2]">
                    {locale === "uk" ? "Навігація" : "Навигация"}
                  </p>
                  <div className="mt-4 grid gap-2.5 text-sm text-white/72">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href} className="transition hover:text-white">
                        {item.label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link href={`/${locale}/admin`} className="transition hover:text-white">
                        {locale === "uk" ? "Панель адміністратора" : "Панель администратора"}
                      </Link>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9fceb2]">
                    {locale === "uk" ? "Контакти" : "Контакты"}
                  </p>
                  <div className="mt-4 grid gap-2.5 text-sm text-white/72">
                    {contacts.phones.map((phone) => (
                      <p key={phone}>{phone}</p>
                    ))}
                    <p>{contacts.telegram}</p>
                    <p>{contacts.viber}</p>
                    <p>{contacts.hours[locale as Locale]}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start justify-between gap-4">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4 text-sm text-white/74 shadow-[0_10px_22px_rgba(20,40,30,0.12)]">
                  <p className="font-medium text-white">
                    {locale === "uk" ? "Швидкий вхід" : "Быстрый вход"}
                  </p>
                  <p className="mt-2 leading-6">
                    {locale === "uk"
                      ? "Увійти в адмінку можна знизу сайту, не перевантажуючи головне меню."
                      : "Войти в админку можно снизу сайта, не перегружая главное меню."}
                  </p>
                </div>

                <Link
                  href={`/${locale}/admin`}
                  className="rounded-full bg-white px-5 py-3 font-medium text-[var(--brand-strong)] shadow-[0_14px_24px_rgba(8,18,13,0.2)] transition hover:translate-y-[-1px] hover:bg-[#edf6ef] hover:shadow-[0_18px_32px_rgba(8,18,13,0.24)]"
                >
                  {isAdmin ? (locale === "uk" ? "Адмінка" : "Админка") : locale === "uk" ? "Увійти" : "Войти"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
