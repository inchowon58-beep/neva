import type { ContentSection, KeywordEntry } from "@/types";
import { inferBreedName } from "@/lib/hero-copy";

export interface ContentTopic {
  id: string;
  heading: string;
  matchTerms: string[];
  buildContent: (breed: string, keyword: string, companyName: string) => string;
  buildSubsections: (breed: string, keyword: string) => { heading: string; content: string }[];
}

const BREED = "네바마스커레이드";

export const NEVA_CONTENT_POOL: ContentTopic[] = [
  {
    id: "origin",
    heading: "유래 및 기원",
    matchTerms: ["유래", "기원", "역사", "혈통", "시베리안"],
    buildContent: (breed) =>
      `${breed}는 시베리안 고양이의 컬러 포인트 변종으로, 러시아 시베리아 혹한 속에서 다져진 견고한 체격과 풍성한 이중모를 지닌 품종입니다. '네바(Neva)'는 러시아어로 '숲'을 뜻하며, '마스커레이드'는 가면처럼 대비되는 포인트 컬러를 연상시킵니다. 1980년대 이후 TICA·FIFe 등 국제 혈통서에 등재되며, 시베리안의 우아함과 블루·실버 포인트의 신비로움이 결합된 품종으로 인정받았습니다. 오랜 혈통 관리와 책임 있는 브리딩을 통해 프리미엄 캐터리에서 가장 사랑받는 대표 품종 중 하나로 자리 잡았으며, 러시아 왕실 고양이로 불릴 만큼 품격 있는 외모와 성격으로 전 세계 애호가들의 관심을 받고 있습니다.`,
    buildSubsections: (breed) => [
      {
        heading: "품종의 역사와 혈통",
        content: `${breed}는 원래 시베리안 고양이에서 포인트 컬러 개체가 선별·교배되며 체계화되었습니다. 1980년대 러시아와 유럽 브리더들의 노력으로 품종 표준이 정립되었고, 이후 국제 묘 등록 기관에 공식 등재되었습니다. 순수 혈통을 유지하려면 부모묘의 계통서(TICA/FIFe)와 브리더 이력을 반드시 확인해야 합니다.`,
      },
      {
        heading: "네바마스커레이드와 시베리안의 차이",
        content: `${breed}는 시베리안과 동일한 체격·성격 기반을 공유하지만, 포인트 컬러(귀·얼굴·꼬리 어두운색)와 더 대비되는 눈 색상이 특징입니다. 털 질감과 알레르기 특성은 시베리안과 유사한 편으로 알려져 있으나, 개체·혈통에 따라 차이가 있을 수 있습니다.`,
      },
    ],
  },
  {
    id: "appearance",
    heading: "외형적 특징",
    matchTerms: ["외형", "외모", "크기", "눈", "코트", "색상", "포인트"],
    buildContent: (breed) =>
      `${breed}는 중·대형 체격에 넓은 가슴과 탄탄한 골격, 깊은 블루·실버 계열의 포인트 컬러가 특징입니다. 둥근 눈은 신비로운 인상을 주며, 풍성한 목·가슴 장식털이 품격 있는 실루엣을 완성합니다. 대형묘 특유의 포근한 존재감과 함께, 한눈에 알아보는 고급스러운 외모가 매력입니다.`,
    buildSubsections: () => [
      {
        heading: "체형과 크기",
        content: "수컷은 보통 6~10kg, 암컷은 4~7kg 전후로 성장하며, 대형묘 카테고리에 속하는 품종입니다.",
      },
    ],
  },
  {
    id: "personality",
    heading: "성격 및 기질",
    matchTerms: ["성격", "기질", "성향", "애교", "성격"],
    buildContent: (breed) =>
      `${breed}는 보호자에게 애정 표현이 풍부하고, 낯선 환경에도 비교적 차분하게 적응하는 편입니다. 장난기와 온화함이 균형을 이루며, 가족 구성원과 함께하는 시간을 즐기는 '소프트하지만 존재감 있는' 성격이 돋보입니다. 혼자 두기보다는 함께하는 일상에 더 빛나는 반려묘입니다.`,
    buildSubsections: () => [
      {
        heading: "가족과의 관계",
        content: "어린이·다른 반려동물과의 적응은 초기 사회화와 환경에 따라 달라지므로, 신뢰할 수 있는 캐터리의 케어 이력을 확인하는 것이 좋습니다.",
      },
    ],
  },
  {
    id: "shedding",
    heading: "털빠짐 정도",
    matchTerms: ["털빠짐", "털 빠짐", "빠짐", "탈모", "molting"],
    buildContent: (breed, keyword) =>
      `${keyword.replace(/\d{2}$/, "")}를 검색하신 분들이 가장 궁금해하시는 ${breed}의 털빠짐 특성부터 상세히 말씀드리겠습니다. ${breed}는 이중모(속털+겉털) 구조로, 봄·가을 환절기에 털갈이가 눈에 띄게 늘 수 있습니다. 일상적으로는 주 2~3회 빗질로 충분히 관리 가능하지만, 털갈이 시기에는 매일 10~15분 가벼운 그루밍을 권장합니다. 품종 특성상 Fel d 1 단백질 수치가 상대적으로 낮은 편으로 알려져 알레르기 반응이 다른 품종보다 적은 경우가 많으나, 개인차가 있으므로 완전 무알레르기로 단정할 수는 없습니다.`,
    buildSubsections: (breed) => [
      {
        heading: "계절별 털갈이 패턴",
        content: `${breed}는 봄(3~5월)과 가을(9~11월)에 털갈이가 집중됩니다. 이 시기에는 언더코트 제거용 빗을 활용하고, 털뭉치·헤어볼 예방을 위해 화섬·오메가3 보조제를 수의사와 상의해 급여할 수 있습니다. 여름에는 속털이 빠지며 체감 털량이 줄어들지만, 실내 온도·습도에 따라 패턴은 달라질 수 있습니다.`,
      },
      {
        heading: "알레르기와 털빠짐의 관계",
        content: `털 자체보다 Fel d 1(침·피지·비듬에 포함)이 알레르기 반응의 주 원인입니다. ${breed}는 털빠짐량과 별개로 알레르기 유발성이 낮은 편으로 알려져 있으나, 정기 목욕·빗질·HEPA 필터·환기 병행이 실질적인 완화에 도움이 됩니다.`,
      },
    ],
  },
  {
    id: "grooming",
    heading: "털 관리 방법",
    matchTerms: ["털관리", "털 관리", "그루밍", "빗질", "목욕", "관리법"],
    buildContent: (breed) =>
      `${breed}의 풍성한 이중모는 주 2~3회 이상의 빗질로 엉킴과 털뭉치를 예방할 수 있습니다. 목욕은 4~8주 간격으로 과도하지 않게, 품종에 맞는 샴푸와 드라이를 권장합니다. 귀·발톱·눈 주변 위생도 정기적으로 점검하면 건강한 코트를 오래 유지할 수 있습니다.`,
    buildSubsections: () => [
      {
        heading: "추천 그루밍 루틴",
        content: "슬리커 브러시와 wide-tooth 빗을 병행하고, 털갈이 시기에는 언더코트 제거용 도구를 활용하세요.",
      },
    ],
  },
  {
    id: "lifespan",
    heading: "평균 수명",
    matchTerms: ["수명", "수명", "나이", "오래", "장수"],
    buildContent: (breed) =>
      `${breed}는 적절한 영양·정기 검진·스트레스 관리가 잘 이루어질 때 평균 12~16년 전후로 건강하게 함께할 수 있는 품종입니다. 유전적 건강과 초기 케어 환경이 수명과 삶의 질에 큰 영향을 미치므로, 분양 전 건강 검진 이력 확인이 중요합니다.`,
    buildSubsections: () => [
      {
        heading: "건강한 노화를 위한 팁",
        content: "중·고령기에는 신장·심장·관절 검진 주기를 촘촘히 하고, 체중 관리와 실내 활동량을 균형 있게 유지하세요.",
      },
    ],
  },
  {
    id: "environment",
    heading: "키우기 좋은 실내 환경",
    matchTerms: ["환경", "실내", "키우기", "캣타워", "공간", "집"],
    buildContent: (breed) =>
      `${breed}는 넓은 활동 공간과 캣타워, 스크래처, 햇빛이 드는 휴식 공간을 갖춘 실내에서 가장 편안해합니다. 대형묘에 맞는 넉넉한 화장실과 안정적인 온도·습도를 유지하면 스트레스를 줄이고 건강한 성장을 돕습니다. No-Cage 환경에서 자란 아이들은 사람과의 유대감 형성에도 유리합니다.`,
    buildSubsections: () => [
      {
        heading: "추천 실내 구성",
        content: "고층 캣타워, 숨을 공간, 창가 퍼치를 마련하고, 다묘 가정이라면 식기·화장실을 분리해 주세요.",
      },
    ],
  },
  {
    id: "health",
    heading: "유전병 및 건강 관리",
    matchTerms: ["유전", "건강", "질병", "검진", "병", "hypertrophic"],
    buildContent: (breed) =>
      `${breed}는 전반적으로 견고한 품종이나, 심장·신장 등 품종 공통 이슈에 대비한 정기 검진이 권장됩니다. 분양 시 부모묘 건강 검사, 접종·구충 기록, 수의사 상담 이력을 확인하세요. 신뢰할 수 있는 캐터리는 투명한 건강 정보를 제공합니다.`,
    buildSubsections: () => [
      {
        heading: "분양 전 체크리스트",
        content: "유전병 스크리닝 여부, 심장 초음파·혈액 검사 기록, 구내염·비만 등 기본 건강 상태를 직접 확인하세요.",
      },
    ],
  },
  {
    id: "allergy",
    heading: "알레르기 유발 물질(Fel d 1) 특성",
    matchTerms: ["알레르기", "알러지", "fel d", "fel d 1", "하이포", "hypo"],
    buildContent: (breed, keyword) =>
      `${keyword} 관련해 많이 질문받는 ${breed}의 Fel d 1(고양이 알레르기 유발 단백질) 특성입니다. ${breed}는 품종 특성상 알레르기 반응이 상대적으로 적은 편으로 알려져 있으나, 개인차가 있으므로 '완전 무알레르기'로 단정할 수는 없습니다. 정기적인 그루밍, 공기 순환, 생활 공간 관리가 실질적인 완화에 도움이 됩니다.`,
    buildSubsections: (breed) => [
      {
        heading: "알레르기 민감 가정을 위한 팁",
        content: `${breed}와 함께하기 전 전문의 상담을 권장하며, 침실 출입 제한·HEPA 필터·자주 환기 등을 병행하세요.`,
      },
    ],
  },
  {
    id: "adoption",
    heading: "입양·분양 시 유의사항",
    matchTerms: ["입양", "분양", "유의", "주의", "선택", "캐터리"],
    buildContent: (breed) =>
      `${breed} 분양 시에는 건강 검진, 혈통·계통, 사육 환경(No-Cage 여부), 사회화 수준을 반드시 확인해야 합니다. 계약서·A/S·환불 정책이 명확한 곳을 선택하고, 직접 방문하거나 영상 상담으로 아이의 상태를 확인하세요.`,
    buildSubsections: () => [
      {
        heading: "신뢰할 수 있는 캐터리 기준",
        content: "투명한 건강 기록, 책임 있는 분양 계약, 분양 후 상담 지원이 갖춰진 곳을 우선하세요.",
      },
    ],
  },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  let s = hashString(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function detectPrimaryTopicId(keyword: string): string | null {
  const normalized = keyword.toLowerCase().replace(/\s/g, "");

  for (const topic of NEVA_CONTENT_POOL) {
    for (const term of topic.matchTerms) {
      const t = term.toLowerCase().replace(/\s/g, "");
      if (normalized.includes(t)) {
        return topic.id;
      }
    }
  }
  return null;
}

export function pickContentTopics(
  keyword: string,
  seed: string,
  count = 4
): ContentTopic[] {
  const primaryId = detectPrimaryTopicId(keyword);
  const pool = NEVA_CONTENT_POOL;

  let candidates = seededShuffle(
    pool.filter((t) => t.id !== primaryId),
    seed + "-rest"
  );

  const selected: ContentTopic[] = [];

  if (primaryId) {
    const primary = pool.find((t) => t.id === primaryId);
    if (primary) selected.push(primary);
  }

  for (const topic of candidates) {
    if (selected.length >= count) break;
    if (!selected.some((s) => s.id === topic.id)) {
      selected.push(topic);
    }
  }

  while (selected.length < count && selected.length < pool.length) {
    for (const topic of pool) {
      if (selected.length >= count) break;
      if (!selected.some((s) => s.id === topic.id)) {
        selected.push(topic);
      }
    }
  }

  return selected.slice(0, count);
}

export function buildStoryBridge(entry: KeywordEntry): string {
  const breed = inferBreedName(entry.keyword) || BREED;
  const company = entry.companyName?.trim() || "프리미엄 캐터리";

  return (
    `${breed}는 이러한 특성을 지닌 만큼, 신뢰할 수 있는 전문 캐터리 선택이 무엇보다 중요합니다. ` +
    `${company}은(는) 케이지 없는(No-Cage) 쾌적한 환경에서 아이들을 정성껏 케어하며, ` +
    `건강 검진과 사회화 프로그램을 거친 ${breed}만을 엄선합니다. ` +
    `전국 직접 안전 인도 서비스를 통해 소중한 묘연을 안심하고 맺어드립니다. ` +
    `지금 바로 분양 상담을 통해 ${entry.keyword.replace(/\d{2}$/, "")}에 맞는 맞춤 안내를 받아보세요.`
  );
}

export function buildIntroFromTopics(
  keyword: string,
  topics: ContentTopic[],
  breed: string
): string {
  const topicNames = topics.map((t) => t.heading).join(", ");
  return (
    `${keyword}를 검색하신 분들께, ${breed}에 대한 전문 정보를 정리했습니다.\n\n` +
    `${breed}는 시베리안 고양이 계열의 컬러 포인트 변종으로, 러시아 왕실의 품격과 대형묘 특유의 포근함, 상대적으로 낮은 Fel d 1(알레르기 유발 단백질) 수치로 사랑받는 프리미엄 반려묘입니다. ` +
    `털빠짐·성격·실내 환경·건강 관리 등 입양 전 꼭 알아야 할 내용을 한곳에 모았습니다.\n\n` +
    `이 페이지에서는 ${topicNames} 등 핵심 주제를 깊이 있게 다룹니다. ` +
    `검색 의도에 맞는 정보를 최상단부터 순서대로 안내하니, ${keyword.replace(/\d{2}$/, "")} 입양을 진지하게 고민하시는 분들께 실질적인 도움이 되길 바랍니다.`
  );
}

export function buildSectionsFromTopics(
  entry: KeywordEntry,
  seed: string
): ContentSection[] {
  const breed = inferBreedName(entry.keyword) || BREED;
  const company = entry.companyName?.trim() || "프리미엄 캐터리";
  const topics = pickContentTopics(entry.keyword, seed, 4);

  return topics.map((topic, index) => {
    let content = topic.buildContent(breed, entry.keyword, company);
    if (index === topics.length - 1 && !content.includes(company)) {
      content += ` ${company}에서 ${breed}에 대한 상담을 받아보실 수 있습니다.`;
    }
    return {
      heading: topic.heading,
      content,
      subsections: topic.buildSubsections(breed, entry.keyword),
    };
  });
}

export function getSelectedTopicHeadings(keyword: string, seed: string): string[] {
  return pickContentTopics(keyword, seed, 4).map((t) => t.heading);
}

const PLACEHOLDER_ENDINGS =
  /(?:을|를|에 대한 정보를)?\s*(?:정리|안내|제공|소개|설명)합니다\.?$/;

export function isThinSectionContent(content: string): boolean {
  const t = content.trim();
  if (t.length < 280) return true;
  if (PLACEHOLDER_ENDINGS.test(t) && t.length < 400) return true;
  return false;
}

export function isThinIntro(intro: string): boolean {
  return intro.trim().length < 350;
}

function findTopicByHeading(heading: string): ContentTopic | undefined {
  const h = heading.replace(/\s/g, "");
  return NEVA_CONTENT_POOL.find((topic) => {
    const th = topic.heading.replace(/\s/g, "");
    if (h.includes(th.slice(0, 4)) || th.includes(h.slice(0, 4))) return true;
    return topic.matchTerms.some((term) => h.includes(term.replace(/\s/g, "")));
  });
}

/** AI가 짧게 생성한 섹션을 풀 기반 풍부한 본문으로 보강 */
export function enrichThinSections(
  sections: ContentSection[],
  entry: KeywordEntry
): ContentSection[] {
  const breed = inferBreedName(entry.keyword) || BREED;
  const company = entry.companyName?.trim() || "프리미엄 캐터리";

  return sections.map((section, index) => {
    const topic = findTopicByHeading(section.heading);
    const poolContent = topic?.buildContent(breed, entry.keyword, company);
    const poolSubs = topic?.buildSubsections(breed, entry.keyword) ?? [];

    let content = section.content;
    if (isThinSectionContent(content) && poolContent) {
      content =
        index === 0 && entry.keyword
          ? `${poolContent}\n\n${entry.keyword}를 검색하신 분들께, 위 내용을 바탕으로 ${breed} 입양을 준비하실 때 참고하시면 좋습니다.`
          : poolContent;
    } else if (isThinSectionContent(content)) {
      content = `${content}\n\n${breed}에 대한 ${section.heading}은 입양 전 반드시 확인해야 할 핵심 정보입니다. 품종 특성, 사육 환경, 건강 검진 이력을 꼼꼼히 비교하고, ${company}와 같은 신뢰할 수 있는 캐터리에서 상담받으시길 권합니다.`;
    }

    let subsections = section.subsections ?? [];
    const thinSubs =
      subsections.length < 2 ||
      subsections.some((s) => s.content.trim().length < 120);

    if (thinSubs && poolSubs.length > 0) {
      subsections = poolSubs.map((sub) => {
        const existing = section.subsections?.find((s) =>
          s.heading.includes(sub.heading.slice(0, 4))
        );
        if (existing && existing.content.trim().length >= 120) return existing;
        return sub;
      });
    }

    if (subsections.length < 2 && poolSubs.length >= 2) {
      subsections = poolSubs.slice(0, 2);
    }

    return { ...section, content, subsections };
  });
}

export function enrichThinIntro(
  intro: string,
  keyword: string,
  topics: ContentTopic[],
  breed: string
): string {
  if (!isThinIntro(intro)) return intro;
  return buildIntroFromTopics(keyword, topics, breed);
}
