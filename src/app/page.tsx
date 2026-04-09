import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { detectLocaleByHeader } from "@/lib/i18n";

export default async function Home() {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get("locale")?.value;
  if (localeFromCookie === "ru" || localeFromCookie === "uk") {
    redirect(`/${localeFromCookie}`);
  }

  const headerStore = await headers();
  const locale = detectLocaleByHeader(headerStore.get("accept-language"));
  redirect(`/${locale}`);
}
