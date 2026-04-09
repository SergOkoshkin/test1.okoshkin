import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { consumeLoginAttempt } from "@/lib/auth-rate-limit";
import { hasValidDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8).max(200),
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 12,
  },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        const forwardedFor = req?.headers?.["x-forwarded-for"];
        const xRealIp = req?.headers?.["x-real-ip"];

        const ipSource = Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor || xRealIp || "unknown";
        const clientIp = String(ipSource).split(",")[0].trim();

        const rateLimitState = consumeLoginAttempt(clientIp);
        if (!rateLimitState.allowed) {
          throw new Error("Too many login attempts");
        }

        if (!hasValidDatabaseUrl()) return null;

        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const admin = await prisma.adminUser.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!admin) return null;

        const passwordOk = await compare(
          parsed.data.password,
          admin.passwordHash,
        );
        if (!passwordOk) return null;

        return {
          id: admin.id,
          email: admin.email,
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: string }).role ?? "admin";
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role =
          typeof token.role === "string" ? token.role : "admin";
      }
      return session;
    },
  },
};
