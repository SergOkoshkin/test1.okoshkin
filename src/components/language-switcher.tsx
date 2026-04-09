"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  locale: "ru" | "uk";
};

function swapLocale(pathname: string, nextLocale: "ru" | "uk") {
  const parts = pathname.split("/");
  if (parts.length > 1 && (parts[1] === "ru" || parts[1] === "uk")) {
    parts[1] = nextLocale;
    return parts.join("/") || `/${nextLocale}`;
  }
  return `/${nextLocale}`;
}

export function LanguageSwitcher({ locale }: Props) {
  const pathname = usePathname() || "/";
  const ruHref = swapLocale(pathname, "ru");
  const ukHref = swapLocale(pathname, "uk");

  return (
    <div className="ml-2 inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/85 p-1 text-xs shadow-[0_8px_22px_rgba(20,40,30,0.08)] backdrop-blur">
      <Link
        href={ruHref}
        className={`rounded-full px-3 py-1.5 font-semibold transition ${
          locale === "ru"
            ? "bg-[var(--brand)] text-white shadow-[0_8px_18px_rgba(47,122,87,0.28)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
        }`}
      >
        RU
      </Link>
      <Link
        href={ukHref}
        className={`rounded-full px-3 py-1.5 font-semibold transition ${
          locale === "uk"
            ? "bg-[var(--brand)] text-white shadow-[0_8px_18px_rgba(47,122,87,0.28)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
        }`}
      >
        UA
      </Link>
    </div>
  );
}
