export const MAIN_KEYWORD = "네바마스커레이드분양";
export const MAIN_TITLE = "네바마스커레이드";
export const RECENT_KEYWORDS_LIMIT = 50;
export const SAMPLE_SLUG = "sample-design";

/** 관리자 키워드 목록 */
export const ADMIN_KEYWORD_LIST_MAX = 1000;
export const ADMIN_KEYWORD_PAGE_SIZE = 15;
export const ADMIN_BULK_AI_BATCH_SIZE = 10;

/** 메인 네이버 노출 사례 */
export const MAIN_NAVER_SHOWCASE_MAX = 5;

/** 관리자 — 캐터리 프리셋 (업체명·이미지·홈페이지·전화) */
export const CATTERY_PRESET = {
  companyName: "캐터리",
  imageUrl: "https://image.cattery.co.kr/neva",
  homepageUrl: "https://www.cattery.co.kr",
  phone: "0505-464-1004",
} as const;

/** 사이트 하단 사업자 정보 */
export const BUSINESS_INFO = {
  companyName: "주식회사 인포씨에스",
  corpRegistration: "224-87-00683",
  address: "경기도 부천시 길주로 246 2층",
  mainSiteUrl: "http://www.dmcmusic.co.kr",
  representative: "조춘원",
  copyrightYear: 2017,
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
