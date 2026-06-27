import type { GeneratedContent, KeywordEntry } from "@/types";
import { SAMPLE_SLUG } from "@/lib/constants";
import { pickHeroVariant } from "@/lib/hero-copy";
import { getDefaultContent } from "@/lib/gemini";

export function getSampleEntry(): KeywordEntry {
  const now = new Date().toISOString();
  return {
    id: "sample",
    slug: SAMPLE_SLUG,
    keyword: "노출페이지 디자인 샘플",
    companyName: "Neva Masquerade Cattery",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    homepageUrl: "https://mainecoon.cattery.co.kr",
    phone: "0505-464-1004",
    pagePrompt: "",
    generatedContent: getSampleContent(),
    contentGeneratedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

export function getSampleContent(): GeneratedContent {
  const seed = "sample-neva";
  const hero = pickHeroVariant("네바마스커레이드", "네바마스커레이드분양", seed);

  return {
    ...getDefaultContent({
      id: "sample",
      slug: SAMPLE_SLUG,
      keyword: "네바마스커레이드분양",
      companyName: "Neva Masquerade Cattery",
      imageUrl: "",
      homepageUrl: "",
      phone: "",
      pagePrompt: "",
      generatedContent: null,
      contentGeneratedAt: null,
      createdAt: "",
      updatedAt: "",
    }),
    title: "노출페이지 디자인 샘플 | 반려동물 품종 SEO 랜딩페이지",
    h1: "네바마스커레이드분양",
    heroEyebrow: hero.heroEyebrow,
    heroTitle: hero.heroTitle,
    heroSubtitle: hero.heroSubtitle,
    heroTheme: hero.heroTitle,
    heroTagline: hero.heroSubtitle,
  };
}

export function isSampleSlug(slug: string): boolean {
  return slug === SAMPLE_SLUG;
}
