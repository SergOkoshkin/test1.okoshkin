import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { CalculatorForm } from "@/components/calculator-form";
import { authOptions } from "@/lib/auth-options";
import { mergeCalculatorOptions } from "@/lib/calculator-options";
import { hasValidDatabaseUrl } from "@/lib/env";
import { Locale, isLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CalculatorPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await getServerSession(authOptions);
  const isAdmin = Boolean(session?.user?.role === "admin");
  const options = hasValidDatabaseUrl()
    ? await prisma.calculatorOption.findMany({
        orderBy: [{ type: "asc" }, { createdAt: "asc" }],
      })
    : [];

  return (
    <main className="container-site py-10">
      <Link
        href={`/${locale}`}
        className="text-sm text-[var(--text-muted)] transition hover:text-[var(--brand)]"
      >
        ← {locale === "uk" ? "Повернутися на головну" : "Вернуться на главную"}
      </Link>
      <div className="mt-4">
        <CalculatorForm
          locale={locale as Locale}
          isAdmin={isAdmin}
          initialOptions={mergeCalculatorOptions(options)}
        />
      </div>
    </main>
  );
}
