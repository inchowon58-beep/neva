import { getAllSlugs } from "@/lib/db";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const slugs = await getAllSlugs();

  const landingPages = slugs.map((slug) => ({
    url: `${baseUrl}/landing/${slug}`,
    lastModified: new Date(),
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
