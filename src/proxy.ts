import { NextRequest, NextResponse } from "next/server";
import { SUPPORTED_LOCALES, detectLocaleByHeader } from "@/lib/i18n";

const LOCALE_COOKIE = "locale";

function hasLocalePrefix(pathname: string) {
  return SUPPORTED_LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

function getLocaleFromPath(pathname: string) {
  const segment = pathname.split("/")[1];
  if (segment === "ru" || segment === "uk") return segment;
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (hasLocalePrefix(pathname)) {
    const localeFromPath = getLocaleFromPath(pathname);
    const response = NextResponse.next();
    if (localeFromPath) {
      response.cookies.set(LOCALE_COOKIE, localeFromPath, {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return response;
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    cookieLocale === "ru" || cookieLocale === "uk"
      ? cookieLocale
      : detectLocaleByHeader(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
