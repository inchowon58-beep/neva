import { getAllKeywords } from "@/lib/db";
import { getSiteBaseUrl, landingPageUrl } from "@/lib/site-url";

/** 빌드 시 DB(Blob) 접근 없이 요청 시점에 생성 */
export const dynamic = "force-dynamic";

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
