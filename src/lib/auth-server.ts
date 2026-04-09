import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";
  if (!session || !isAdmin) return null;
  return session;
}
