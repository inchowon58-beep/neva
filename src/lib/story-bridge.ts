import type { KeywordEntry } from "@/types";
import { inferBreedName } from "@/lib/hero-copy";

export interface StoryBridgeFeature {
  icon: string;
  title: string;
  description: string;
}

export interface StructuredStoryBridge {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  lead: string;
  features: StoryBridgeFeature[];
  closing: string;
  ctaLabel: string;
}

function attachEunNeun(name: string): string {
  if (!name) return "";
  const code = name.charCodeAt(name.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return `${name}는`;
  const hasBatchim = (code - 0xac00) % 28 !== 0;
  return `${name}${hasBatchim ? "은" : "는"}`;
}

export function buildStructuredStoryBridge(entry: KeywordEntry): StructuredStoryBridge {
  const breed = inferBreedName(entry.keyword) || "네바마스커레이드";
  const company = entry.companyName?.trim() || "프리미엄 캐터리";
  const keywordClean = entry.keyword.replace(/\d{2}$/, "");

  return {
    eyebrow: "Trusted Cattery",
    headline: "신뢰할 수 있는 전문 캐터리,",
    headlineAccent: company,
    lead: `${breed}는 품종 특성을 온전히 이해하고 책임 있게 분양하는 곳을 선택하는 것이 무엇보다 중요합니다.`,
    features: [
      {
        icon: "🏡",
        title: "No-Cage 케어",
        description: "케이지 없는 쾌적한 환경에서 자연스럽게 사회화된 아이들만 케어합니다.",
      },
      {
        icon: "🩺",
        title: "건강 · 혈통 검증",
        description: `건강 검진과 사회화 프로그램을 거친 ${breed}만을 엄선하여 분양합니다.`,
      },
      {
        icon: "🚗",
        title: "전국 안전 인도",
        description: "전국 직접 안전 인도 서비스로 소중한 묘연을 안심하고 맺어드립니다.",
      },
    ],
    closing: `${attachEunNeun(company)} ${keywordClean} 입양을 진지하게 고민하신다면, 맞춤 상담으로 안내해 드리겠습니다.`,
    ctaLabel: "분양 상담 신청하기",
  };
}

/** 구형 단일 문자열 storyBridge → 구조화 (폴백) */
export function parseLegacyStoryBridge(
  text: string,
  entry: KeywordEntry
): StructuredStoryBridge {
  const structured = buildStructuredStoryBridge(entry);
  if (text.length > 50 && text.includes("No-Cage")) {
    return structured;
  }
  return { ...structured, lead: text.slice(0, 120) || structured.lead };
}
