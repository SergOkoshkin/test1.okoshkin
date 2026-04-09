import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { AdminLoginForm } from "@/components/admin-login-form";
import { AdminManagement } from "@/components/admin-management";
import { AdminSignOutButton } from "@/components/admin-signout-button";
import { Locale, isLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { hasValidDatabaseUrl } from "@/lib/env";
import { authOptions } from "@/lib/auth-options";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getLatestLeads() {
  if (!hasValidDatabaseUrl()) return [];
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 25,
    select: {
      id: true,
      name: true,
      phone: true,
      productType: true,
      estimateMin: true,
      estimateMax: true,
      status: true,
    },
  });
}

async function getLatestComments() {
  if (!hasValidDatabaseUrl()) return [];
  return prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 25,
    select: {
      id: true,
      name: true,
      body: true,
      rating: true,
      photoUrl: true,
      status: true,
    },
  });
}

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <main className="container-site py-10">
        <AdminLoginForm locale={locale as Locale} />
      </main>
    );
  }

  const [leads, comments] = await Promise.all([getLatestLeads(), getLatestComments()]);

  return (
    <main className="container-site py-10">
      <section className="rounded-3xl border border-[var(--line-soft)] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">
              {locale === "uk" ? "Панель адміністратора" : "Панель администратора"}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {locale === "uk"
                ? "Керування заявками та відгуками"
                : "Управление заявками и отзывами"}
            </p>
          </div>
          <AdminSignOutButton locale={locale as Locale} />
        </div>

        {!hasValidDatabaseUrl() && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {locale === "uk"
              ? "Не заповнено DATABASE_URL. Підключіть Supabase у .env."
              : "Не заполнен DATABASE_URL. Подключите Supabase в .env."}
          </div>
        )}

        <AdminManagement locale={locale as Locale} initialLeads={leads} initialComments={comments} />
      </section>
    </main>
  );
}
