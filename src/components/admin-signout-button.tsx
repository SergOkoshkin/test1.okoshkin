"use client";

import { signOut } from "next-auth/react";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export function AdminSignOutButton({ locale }: Props) {
  return (
    <button
      className="rounded-lg border border-[var(--line-soft)] px-3 py-2 text-sm transition hover:border-[var(--brand)]"
      onClick={() => signOut({ callbackUrl: `/${locale}/admin` })}
      type="button"
    >
      {locale === "uk" ? "Вийти" : "Выйти"}
    </button>
  );
}
