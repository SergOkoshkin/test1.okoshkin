export function hasValidDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (url.includes("johndoe:randompassword")) return false;
  if (url.includes("USER:PASSWORD@HOST")) return false;
  return true;
}
