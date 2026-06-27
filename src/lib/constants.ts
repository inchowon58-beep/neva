export const MAIN_KEYWORD = "네바마스커레이드분양";
export const MAIN_TITLE = "네바마스커레이드";
export const RECENT_KEYWORDS_LIMIT = 50;
export const SAMPLE_SLUG = "sample-design";

/** 관리자 — 캐터리 프리셋 (업체명·이미지·홈페이지·전화) */
export const CATTERY_PRESET = {
  companyName: "캐터리",
  imageUrl: "https://image.cattery.co.kr/neva",
  homepageUrl: "https://www.cattery.co.kr",
  phone: "0505-464-1004",
} as const;

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
