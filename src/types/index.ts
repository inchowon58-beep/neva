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

export interface Database {
  keywords: KeywordEntry[];
  mainPages: MainPageLink[];
}
