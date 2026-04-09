import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.includes("USER:PASSWORD@HOST")) {
    throw new Error("Set valid DATABASE_URL in .env before creating admin.");
  }

  if (!email) {
    throw new Error("Set ADMIN_EMAIL in .env");
  }

  if (!password || password.length < 10) {
    throw new Error("Set ADMIN_PASSWORD in .env (minimum 10 characters)");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`Admin is ready: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
