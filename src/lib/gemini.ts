import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ContentSection, GeneratedContent, HeroCopy, KeywordEntry } from "@/types";
import {
  createVariationSeed,
  getBreedUsps,
  inferBreedName,
  pickHeroVariant,
  sanitizeBreedText,
  containsForeignBreed,
  isWeakHeroCopy,
} from "@/lib/hero-copy";
import {
  buildIntroFromTopics,
  buildSectionsFromTopics,
  buildStoryBridge,
  detectPrimaryTopicId,
  enrichThinIntro,
  enrichThinSections,
  getSelectedTopicHeadings,
  isThinIntro,
  isThinSectionContent,
  pickContentTopics,
} from "@/lib/content-pool";

const GENERATION_CONFIG = {
  temperature: 0.85,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

const SEO_DEPTH_GUIDE = `
## SEO 본문 깊이 규칙 (필수 — 미준수 시 실패)

⚠️ "만들다 만" 느낌의 짧은 문장, 목차형 한 줄 설명, "~을 정리합니다/안내합니다"만 적고 끝내기 **절대 금지**.

### 분량 (한국어 기준, 공백 포함)
- intro: **최소 450자**, 3문단. 1문단에 타겟 키워드 1회, 품종 소개 + 검색 의도 충족
- sections 각 H2 content: **최소 380자**, 4~6문장. 구체적 수치·팁·주의사항 포함
- subsections: **H3당 최소 2개**, 각 H3 content **최소 180자**
- storyBridge: **200~350자**, 업체명·No-Cage·안전 인도 자연 포함
- metaDescription: 120~150자, 키워드 + 클릭 유도

### 작성 품질
- 전문가가 직접 쓴 것처럼 **완결된 설명문** (나열·개요만 X)
- 키워드를 H2 첫 문장·intro·metaDescription에 자연스럽게 배치
- 각 섹션마다 독자가 실제로 알고 싶어하는 **구체 정보** (예: 빗질 주기, kg, Fel d 1, 검진 항목)
- 다른 H2와 문장·표현 중복 최소화`;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
  }
  return new GoogleGenerativeAI(apiKey);
}

export const DEFAULT_PROMPT = `당신은 '반려동물/동물 품종 전문 SEO 콘텐츠 생성기'이자 '프리미엄 캐터리 카피라이터'입니다.
키워드에 '분양'이 포함되어도 반드시 반려동물 입양·분양(펫) 맥락으로만 작성하세요.
절대 부동산, 아파트, 입지, 교통 등 부동산 분양 콘텐츠를 생성하지 마세요.`;

const HERO_COPY_GUIDE = `
## 메인 히어로 카피 생성 가이드 (최우선)

### 톤앤매너
- 최고급 캐터리(Cattery) 및 전문 분양 브랜드에 걸맞은 프리미엄, 감성적, 신뢰감 있는 어조
- "가치 있고 소중한", "묘연", "품격", "기적", "은빛", "신비로운" 등 감성적 표현 활용
- 단순 사실 나열 금지 (예: "○○는 알러지 없는 고양이입니다" 같은 밋밋한 문장 X)

### 품종 집중 규칙 (엄격)
- 타겟 품종명만 사용하세요. 괄호로 다른 품종명 혼용 금지 (예: "네바마스커레이드(메인쿤)" X)
- 메인쿤, 페르시안 등 타겟 품종이 아닌 다른 품종명을 언급하지 마세요
- 지역명(수원, 인천 등)은 heroTitle/heroSubtitle에 넣지 마세요

### 텍스트 다양성 (Dynamic)
- variationSeed가 제공되면, 동일 품종이라도 매번 다른 문장 구조·감성 표현·단어 배열로 작성
- 이전 생성과 비슷한 패턴 반복을 피하고, Type A/B/C 중 하나의 스타일을 변형하여 적용

### 출력 예시 스타일

[Type A]
- heroEyebrow: PREMIUM CATTERY · TRUSTED ADOPTION
- heroTitle: 고양이 알레르기로 망설였다면, 네바마스커레이드라는 기적
- heroSubtitle: 러시아 왕실이 사랑한 신비로운 눈빛과 퐁퐁한 코트, 알레르기 반응이 적어 더 안심할 수 있는 품격 있는 대형묘를 만나보세요.

[Type B]
- heroEyebrow: COZY ENVIRONMENT · HEALTHY COMPANION
- heroTitle: 당신의 삶에 스며드는 은빛 묘연, 네바마스커레이드
- heroSubtitle: 빽빽한 이중모 속에 숨겨진 부드러운 성격. 알레르기 걱정 없이 온전히 사랑만 줄 수 있도록, 건강하게 자란 아이들만 엄선하여 전해드립니다.

heroTitle: 15~35자, 감성적이고 임팩트 있는 완성형 문장 (짧은 키워드 나열 X)
heroSubtitle: 40~90자, 품종 USP 2~3개를 자연스럽게 녹인 프리미엄 카피
heroEyebrow: 영문 대문자 + · 구분 (예: PREMIUM CATTERY · TRUSTED ADOPTION)`;

const REQUIRED_SECTIONS = [
  "소개 및 유래",
  "외형적 특징",
  "성격 및 기질",
  "털 빠짐 및 관리법",
  "키우기 좋은 환경",
  "입양·분양 시 유의사항",
];

const JSON_SCHEMA = `
반드시 아래 JSON 스키마만 출력 (마크down 코드블록 없이 순수 JSON만):

{
  "title": "SEO 페이지 타이틀 (60자 이내, 키워드 포함)",
  "metaDescription": "메타 설명 (150자 이내)",
  "h1": "SEO용 헤드라인 (키워드 포함)",
  "heroEyebrow": "상단 카피 (영문, PREMIUM CATTERY · TRUSTED ADOPTION 형식)",
  "heroTitle": "메인 타이틀 (감성적 프리미엄 완성형 문장, 품종명 포함)",
  "heroSubtitle": "서브 타이틀 (품종 USP 2~3개를 녹인 1~2문장)",
  "intro": "품종 소개 (3문단, 최소 450자, 키워드·검색 의도 반영)",
  "sections": [
    {
      "heading": "H2 섹션 제목",
      "content": "H2 본문 (최소 380자, 4~6문장의 완결된 전문 설명)",
      "subsections": [
        { "heading": "H3 소제목", "content": "H3 본문 (최소 180자)" },
        { "heading": "H3 소제목", "content": "H3 본문 (최소 180자)" }
      ]
    }
  ],
  "storyBridge": "정보→분양 전환 문단 (200~350자, 업체명·No-Cage·안전 인도)",
  "ctaText": "연락처 안내 문구"
}

본문 sections는 아래 [선택된 4개 주제]만 H2로 작성 (정확히 4개, 순서 준수).
타겟 키워드 주제가 있으면 반드시 sections[0] (최상단 H2)에 배치.`;

function buildPrompt(entry: KeywordEntry, variationSeed: string): string {
  const custom = entry.pagePrompt?.trim();
  const instructions = custom || DEFAULT_PROMPT;
  const breed = inferBreedName(entry.keyword);
  const usps = getBreedUsps(breed, entry.keyword);
  const topics = pickContentTopics(entry.keyword, variationSeed, 4);
  const topicHeadings = topics.map((t) => t.heading);
  const primaryId = detectPrimaryTopicId(entry.keyword);
  const company = entry.companyName?.trim() || "프리미엄 캐터리";

  const contentPoolGuide = `
## 본문 구성 규칙 (SEO 유사문서 방지 + 충분한 분량)
- 아래 [선택된 4개 주제]만 H2 섹션으로 작성 (정확히 4개)
- ${primaryId ? `⚠️ 타겟 키워드와 매칭된 '${topics[0].heading}' 주제를 sections[0] 최상단에 배치` : "주제 순서는 검색 의도에 맞게 배치"}
- [선택된 4개 주제]: ${topicHeadings.join(" → ")}
- 각 H2는 해당 주제를 **끝까지 설명하는 완성형 글** (개요 한 줄 X)
- H2마다 subsections **최소 2개** H3 필수
- 업체명 '${company}'을 storyBridge와 마지막 섹션 본문에 자연스럽게 1회 이상 포함`;

  return `${instructions}
${HERO_COPY_GUIDE}
${SEO_DEPTH_GUIDE}
${contentPoolGuide}

[생성 대상 키워드]: ${entry.keyword}
[타겟 품종명]: ${breed}
[품종 핵심 USP — 반드시 heroSubtitle에 2~3개 반영]: ${usps.join(", ")}
[업체명/캐터리]: ${company}
[variationSeed]: ${variationSeed} (이 시드에 따라 표현을 다르게 조합)

⚠️ '${breed}' 품종만 언급. 다른 품종명 혼용 금지.
${JSON_SCHEMA}`;
}

function normalizeSections(sections: ContentSection[]): ContentSection[] {
  return sections.map((s) => ({
    heading: s.heading,
    content: s.content,
    subsections: s.subsections ?? [],
  }));
}

function resolveHeroCopy(
  raw: Partial<GeneratedContent>,
  keyword: string,
  seed: string
): HeroCopy {
  const breed = inferBreedName(keyword);
  const fallback = pickHeroVariant(breed, keyword, seed);

  const sanitize = (s: string) => sanitizeBreedText(s, breed, keyword);

  const rawTitle = sanitize(raw.heroTitle?.trim() || raw.heroTheme?.trim() || "");
  const rawSubtitle = sanitize(raw.heroSubtitle?.trim() || raw.heroTagline?.trim() || "");
  const rawEyebrow = raw.heroEyebrow?.trim() || "";

  const titleContaminated = containsForeignBreed(rawTitle, breed, keyword);
  const subtitleContaminated = containsForeignBreed(rawSubtitle, breed, keyword);

  const hasNewFormat = Boolean(rawTitle && rawSubtitle);

  if (hasNewFormat && !titleContaminated && !subtitleContaminated && !isWeakHeroCopy(rawTitle) && !isWeakHeroCopy(rawSubtitle)) {
    return {
      heroEyebrow: rawEyebrow || fallback.heroEyebrow,
      heroTitle: rawTitle,
      heroSubtitle: rawSubtitle,
    };
  }

  if (rawTitle && !titleContaminated && !isWeakHeroCopy(rawTitle) && rawTitle.length >= 12) {
    return {
      heroEyebrow: rawEyebrow || fallback.heroEyebrow,
      heroTitle: rawTitle,
      heroSubtitle:
        rawSubtitle && !subtitleContaminated && !isWeakHeroCopy(rawSubtitle)
          ? rawSubtitle
          : fallback.heroSubtitle,
    };
  }

  return fallback;
}

function sanitizeSectionContent(
  sections: ContentSection[],
  breed: string,
  keyword: string
): ContentSection[] {
  const sanitize = (s: string) => sanitizeBreedText(s, breed, keyword);
  return sections.map((s) => ({
    heading: sanitize(s.heading),
    content: sanitize(s.content),
    subsections: (s.subsections ?? []).map((sub) => ({
      heading: sanitize(sub.heading),
      content: sanitize(sub.content),
    })),
  }));
}

function reorderSectionsForPrimary(
  sections: ContentSection[],
  keyword: string
): ContentSection[] {
  const primaryId = detectPrimaryTopicId(keyword);
  if (!primaryId || sections.length === 0) return sections;

  const primaryTerms = {
    origin: ["유래", "기원"],
    appearance: ["외형"],
    personality: ["성격", "기질"],
    shedding: ["털빠짐", "털 빠짐"],
    grooming: ["털 관리", "그루밍"],
    lifespan: ["수명"],
    environment: ["환경", "실내"],
    health: ["유전", "건강"],
    allergy: ["알레르기", "알러지", "fel"],
    adoption: ["입양", "분양"],
  }[primaryId] ?? [];

  const idx = sections.findIndex((s) =>
    primaryTerms.some((t) => s.heading.includes(t))
  );
  if (idx <= 0) return sections;

  const reordered = [...sections];
  const [primary] = reordered.splice(idx, 1);
  reordered.unshift(primary);
  return reordered;
}

export function normalizeGeneratedContent(
  raw: Partial<GeneratedContent> & { intro: string; sections: ContentSection[] },
  keyword: string,
  seed?: string,
  entry?: KeywordEntry
): GeneratedContent {
  const breed = inferBreedName(keyword);
  const variationSeed = seed ?? keyword;
  const hero = resolveHeroCopy(raw, keyword, variationSeed);
  const topics = pickContentTopics(keyword, variationSeed, 4);

  let intro = sanitizeBreedText(raw.intro, breed, keyword);
  if (entry) {
    intro = enrichThinIntro(intro, keyword, topics, breed);
  }

  let sections = sanitizeSectionContent(
    normalizeSections(raw.sections),
    breed,
    keyword
  );
  sections = reorderSectionsForPrimary(sections, keyword);

  if (entry) {
    sections = enrichThinSections(sections, entry);
  }

  const storyBridge = raw.storyBridge?.trim() && raw.storyBridge.trim().length >= 180
    ? sanitizeBreedText(raw.storyBridge, breed, keyword)
    : entry
      ? buildStoryBridge(entry)
      : buildStoryBridge({
          id: "",
          slug: "",
          keyword,
          companyName: "",
          imageUrl: "",
          homepageUrl: "",
          phone: "",
          pagePrompt: "",
          generatedContent: null,
          contentGeneratedAt: null,
          createdAt: "",
          updatedAt: "",
        });

  return {
    title: sanitizeBreedText(raw.title || `${keyword} | ${breed} 품종 정보`, breed, keyword),
    metaDescription: sanitizeBreedText(raw.metaDescription || `${keyword} 전문 품종 정보`, breed, keyword),
    h1: raw.h1 || keyword,
    heroEyebrow: hero.heroEyebrow,
    heroTitle: hero.heroTitle,
    heroSubtitle: hero.heroSubtitle,
    heroTheme: hero.heroTitle,
    heroTagline: hero.heroSubtitle,
    intro: sanitizeBreedText(intro, breed, keyword),
    sections,
    storyBridge,
    ctaText: raw.ctaText || "연락처 안내",
  };
}

function parseGeneratedContent(
  text: string,
  keyword: string,
  seed: string,
  entry?: KeywordEntry
): GeneratedContent {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const parsed = JSON.parse(cleaned) as Partial<GeneratedContent> & {
    intro: string;
    sections: ContentSection[];
  };

  if (!parsed.intro || !Array.isArray(parsed.sections)) {
    throw new Error("Gemini 응답 형식이 올바르지 않습니다.");
  }

  return normalizeGeneratedContent(parsed, keyword, seed, entry);
}

function countThinSections(sections: ContentSection[]): number {
  return sections.filter((s) => isThinSectionContent(s.content)).length;
}

export async function generateLandingContent(
  entry: KeywordEntry
): Promise<GeneratedContent> {
  const genAI = getClient();
  const variationSeed = `${createVariationSeed(entry)}-${Date.now()}`;
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: GENERATION_CONFIG,
  });

  const result = await model.generateContent(buildPrompt(entry, variationSeed));
  let text = result.response.text();
  let content = parseGeneratedContent(text, entry.keyword, variationSeed, entry);

  const thinCount = countThinSections(content.sections);
  if (thinCount >= 2 || isThinIntro(content.intro)) {
    const retryPrompt =
      buildPrompt(entry, variationSeed + "-retry") +
      `\n\n⚠️ 재생성 요청: 이전 결과가 너무 짧았습니다. intro 450자+, 각 H2 380자+, H3 각 180자+ 반드시 충족. placeholder 문장 금지.`;
    const retry = await model.generateContent(retryPrompt);
    text = retry.response.text();
    try {
      content = parseGeneratedContent(text, entry.keyword, variationSeed, entry);
    } catch {
      /* 1차 enrich 결과 유지 */
    }
  }

  return content;
}

export function getDefaultContent(entry: KeywordEntry): GeneratedContent {
  const breed = inferBreedName(entry.keyword);
  const seed = createVariationSeed(entry);
  const hero = pickHeroVariant(breed, entry.keyword, seed);
  const topics = pickContentTopics(entry.keyword, seed, 4);
  const sections = buildSectionsFromTopics(entry, seed);
  const topicHeadings = getSelectedTopicHeadings(entry.keyword, seed);

  return normalizeGeneratedContent(
    {
      title: `${entry.keyword} | ${breed} 품종 정보 및 입양 안내`,
      metaDescription: `${entry.keyword} — ${topicHeadings.join(", ")} 등 ${breed} 전문 정보.`,
      h1: entry.keyword,
      heroEyebrow: hero.heroEyebrow,
      heroTitle: hero.heroTitle,
      heroSubtitle: hero.heroSubtitle,
      intro: buildIntroFromTopics(entry.keyword, topics, breed),
      sections,
      storyBridge: buildStoryBridge(entry),
      ctaText: "연락처 안내",
    },
    entry.keyword,
    seed,
    entry
  );
}

export { REQUIRED_SECTIONS, inferBreedName };
