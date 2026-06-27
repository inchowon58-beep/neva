import { getAllKeywords } from "@/lib/db";
import { getSiteBaseUrl, landingPageUrl } from "@/lib/site-url";
import { getDefaultContent, normalizeGeneratedContent } from "@/lib/gemini";
import { createVariationSeed } from "@/lib/hero-copy";

export const dynamic = "force-dynamic";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** 최근 등록 랜딩페이지 RSS (네이버·구글 피드 제출용) */
export async function GET() {
  const baseUrl = getSiteBaseUrl();
  const keywords = (await getAllKeywords()).slice(0, 50);

  const items = keywords.map((entry) => {
    const content = entry.generatedContent
      ? normalizeGeneratedContent(
          entry.generatedContent,
          entry.keyword,
          createVariationSeed(entry),
          entry
        )
      : getDefaultContent(entry);

    const link = landingPageUrl(entry.slug, baseUrl);
    const pubDate = new Date(entry.createdAt).toUTCString();

    return `<item>
<title>${escapeXml(content.title)}</title>
<link>${escapeXml(link)}</link>
<guid isPermaLink="true">${escapeXml(link)}</guid>
<description>${escapeXml(content.metaDescription)}</description>
<pubDate>${pubDate}</pubDate>
</item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml("네바마스커레이드 키워드 랜딩")}</title>
<link>${escapeXml(baseUrl)}</link>
<description>${escapeXml("키워드별 SEO 랜딩페이지 최신 등록 목록")}</description>
<language>ko</language>
${items.join("\n")}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
