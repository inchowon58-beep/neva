export interface ContentSubsection {
  heading: string;
  content: string;
}

export interface ContentSection {
  heading: string;
  content: string;
  subsections?: ContentSubsection[];
}

export interface HeroCopy {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
}

export interface GeneratedContent {
  title: string;
  metaDescription: string;
  h1: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  /** @deprecated heroTitle 호환 */
  heroTheme?: string;
  /** @deprecated heroSubtitle 호환 */
  heroTagline?: string;
  intro: string;
  sections: ContentSection[];
  ctaText: string;
  /** 정보 섹션 → 분양 전환을 잇는 업체 추천 문단 */
  storyBridge?: string;
}

export interface LandingImage {
  src: string;
  alt: string;
  fallbackSrcs?: string[];
}

export interface KeywordEntry {
  id: string;
  slug: string;
  keyword: string;
  companyName: string;
  imageUrl: string;
  homepageUrl: string;
  phone: string;
  pagePrompt: string;
  generatedContent: GeneratedContent | null;
  contentGeneratedAt: string | null;
  /** IndexNow 마지막 전송 시각 (24시간 내 재전송 방지) */
  indexNowSubmittedAt?: string | null;
  /** 관리자 목록에서 숨김 (랜딩 페이지는 유지) */
  hiddenFromAdminAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KeywordInput {
  keyword: string;
  companyName: string;
  imageUrl: string;
  homepageUrl: string;
  phone: string;
  pagePrompt: string;
}

/** txt 일괄 등록 시 키워드 제외 공통 필드 */
export type KeywordBulkDefaults = Omit<KeywordInput, "keyword">;

export interface MainPageLink {
  id: string;
  keyword: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface MainPageInput {
  keyword: string;
  path: string;
}

/** 메인 노출 사례 — 네이버 순위 확인용 */
export interface NaverShowcase {
  id: string;
  keyword: string;
  companyName: string;
  /** 화면에 표시할 등록일 */
  displayDate: string;
  /** 네이버 노출 순위 (예: 1) */
  rank: number;
  /** 비어 있으면 키워드로 네이버 검색 URL 자동 생성 */
  naverSearchUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface NaverShowcaseInput {
  keyword: string;
  companyName: string;
  displayDate: string;
  rank?: number;
  naverSearchUrl?: string;
}

export interface Database {
  keywords: KeywordEntry[];
  mainPages: MainPageLink[];
  naverShowcases: NaverShowcase[];
}
