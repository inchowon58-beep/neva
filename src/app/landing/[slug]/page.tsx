import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPageView from "@/components/LandingPageView";
import { decodeSlug } from "@/lib/constants";
import { getKeywordBySlug } from "@/lib/db";
import { getDefaultContent, normalizeGeneratedContent } from "@/lib/gemini";
import { createVariationSeed } from "@/lib/hero-copy";
import { getOrGenerateContent } from "@/lib/landing";
import { getSampleContent, getSampleEntry, isSampleSlug } from "@/lib/sample";
import { ensureSeedData } from "@/lib/seed";
import { getSiteBaseUrl, landingPageUrl } from "@/lib/site-url";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);

  if (isSampleSlug(slug)) {
    const content = getSampleContent();
    return {
      title: content.title,
      description: content.metaDescription,
      robots: { index: false, follow: false },
    };
  }

  const entry = await getKeywordBySlug(slug);
  if (!entry) {
    return { title: "페이지를 찾을 수 없습니다" };
  }

  const content = entry.generatedContent
    ? normalizeGeneratedContent(
        entry.generatedContent,
        entry.keyword,
        createVariationSeed(entry),
        entry
      )
    : getDefaultContent(entry);

  return {
    title: content.title,
    description: content.metaDescription,
    keywords: [entry.keyword, "네바마스커레이드", "고양이분양", "캐터리"],
    openGraph: {
      title: content.title,
      description: content.metaDescription,
      type: "website",
      locale: "ko_KR",
      url: landingPageUrl(slug),
      images: entry.imageUrl ? [{ url: entry.imageUrl, alt: entry.keyword }] : [],
    },
    alternates: {
      canonical: landingPageUrl(slug),
    },
  };
}

export default async function LandingPage({ params }: PageProps) {
  await ensureSeedData();
  const { slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);

  if (isSampleSlug(slug)) {
    const entry = getSampleEntry();
    const content = getSampleContent();
    return <LandingPageView entry={entry} content={content} variant="sample" />;
  }

  const entry = await getKeywordBySlug(slug);
  if (!entry) {
    notFound();
  }

  const { entry: finalEntry, content } = await getOrGenerateContent(entry);

  const pageUrl = landingPageUrl(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: content.title,
    description: content.metaDescription,
    url: pageUrl,
    ...(finalEntry.phone && { telephone: finalEntry.phone }),
    ...(finalEntry.imageUrl && { image: finalEntry.imageUrl }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPageView entry={finalEntry} content={content} />
    </>
  );
}

export const dynamic = "force-dynamic";
