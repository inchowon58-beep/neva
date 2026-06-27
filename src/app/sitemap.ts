import { getAllKeywords } from "@/lib/db";
import { getSiteBaseUrl, landingPageUrl } from "@/lib/site-url";

export default async function sitemap() {
  const baseUrl = getSiteBaseUrl();
  const keywords = await getAllKeywords();

  const landingPages = keywords.map((entry) => ({
    url: landingPageUrl(entry.slug, baseUrl),
    lastModified: new Date(entry.updatedAt || entry.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    ...landingPages,
  ];
}
