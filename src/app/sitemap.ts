import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const routes = ["/ru", "/uk", "/ru/calculator", "/uk/calculator"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "weekly",
    priority: route.includes("calculator") ? 0.8 : 1,
  }));
}
