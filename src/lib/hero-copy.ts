import type { HeroCopy } from "@/types";

export const BREED_USP: Record<string, string[]> = {
  네바마스커레이드: [
    "알레르기 유발 적음",
    "러시아 왕실 고양이",
    "신비로운 눈빛",
    "대형묘의 포근함",
    "은빛·블루 포인트 코트",
    "품격 있는 묘연",
  ],
  메인쿤: [
    "순한 거인",
    "풍성한 장모",
    "가족 친화적 성격",
    "대형묘의 위엄",
    "높은 지능과 애교",
    "프리미엄 캐터리 인기",
  ],
  시베리안: [
    "하이포알러제닉",
    "알레르기 걱정 완화",
    "풍성한 트리플 코트",
    "활발하고 장난기",
    "건강한 혈통",
    "은은한 품격",
  ],
  러시안블루: [
    "은빛 실크 코트",
    "에메랄드 눈빛",
    "차분한 고급스러움",
    "조용한 애교",
    "우아한 실루엣",
    "프리미엄 반려묘",
  ],
  브리티시: [
    "둥근 얼굴과 볼",
    "듬직한 체형",
    "안정적 성격",
    "가족과의 조화",
    "플러시 코트",
    "신뢰감 있는 품종",
  ],
};

const NEVA_VARIANTS: HeroCopy[] = [
  {
    heroEyebrow: "PREMIUM CATTERY · TRUSTED ADOPTION",
    heroTitle: "고양이 알레르기로 망설였다면, 네바마스커레이드라는 기적",
    heroSubtitle:
      "러시아 왕실이 사랑한 신비로운 눈빛과 퐁퐁한 코트. 알레르기 반응이 적어 더 안심할 수 있는, 품격 있는 대형묘를 만나보세요.",
  },
  {
    heroEyebrow: "COZY ENVIRONMENT · HEALTHY COMPANION",
    heroTitle: "당신의 삶에 스며드는 은빛 묘연, 네바마스커레이드",
    heroSubtitle:
      "빽빽한 이중모 속에 숨겨진 부드러운 성격. 알레르기 걱정 없이 온전히 사랑만 줄 수 있도록, 건강하게 자란 아이들만 엄선하여 전해드립니다.",
  },
  {
    heroEyebrow: "ROYAL HERITAGE · GENTLE GIANT",
    heroTitle: "신비로운 눈빛이 선사하는 품격, 네바마스커레이드",
    heroSubtitle:
      "왕실의 우아함과 대형묘만의 포근한 존재감. 가치 있고 소중한 반려묘와의 인연, 프리미엄 캐터리에서 시작됩니다.",
  },
  {
    heroEyebrow: "HYPOALLERGENIC · PURE BREED",
    heroTitle: "알레르기 걱정을 덜어주는, 네바마스커레이드의 약속",
    heroSubtitle:
      "섬세한 코트와 낮은 알레르기 유발성. 러시아 왕실의 혈통이 빚어낸 신비로운 아름다움을, 당신의 일상에 품격 있게 담아드립니다.",
  },
];

const MAINE_COON_VARIANTS: HeroCopy[] = [
  {
    heroEyebrow: "PREMIUM CATTERY · GENTLE GIANT",
    heroTitle: "순한 거인이 전하는 따스함, 메인쿤",
    heroSubtitle:
      "풍성한 장모와 넉넉한 체격, 그러나 마음은 어린아이처럼 다정합니다. 가족 모두가 사랑하는 프리미엄 대형묘를 만나보세요.",
  },
  {
    heroEyebrow: "TRUSTED ADOPTION · HEALTHY LINEAGE",
    heroTitle: "당신의 하루를 채우는 포근한 존재, 메인쿤",
    heroSubtitle:
      "높은 지능과 애교, 뛰어난 사교성. 건강한 혈통과 책임 있는 케어로 자란 메인쿤만을 엄선하여 전해드립니다.",
  },
];

const SIBERIAN_VARIANTS: HeroCopy[] = [
  {
    heroEyebrow: "HYPOALLERGENIC · NATURAL BEAUTY",
    heroTitle: "알레르기 걱정을 줄여주는, 시베리안의 기운",
    heroSubtitle:
      "시베리아 숲이 키운 튼튼한 혈통과 풍성한 트리플 코트. 하이포알러제닉 특성으로 더 안심할 수 있는 프리미엄 반려묘입니다.",
  },
  {
    heroEyebrow: "PREMIUM CATTERY · ACTIVE SPIRIT",
    heroTitle: "활기와 품격을 동시에, 시베리안 고양이",
    heroSubtitle:
      "장난기 많은 성격과 은은한 고급스러움. 가치 있고 소중한 반려묘와의 인연을 프리미엄 캐터리에서 시작하세요.",
  },
];

const GENERIC_VARIANTS: HeroCopy[] = [
  {
    heroEyebrow: "PREMIUM CATTERY · TRUSTED ADOPTION",
    heroTitle: "품격 있는 반려묘와의 특별한 인연",
    heroSubtitle:
      "건강한 혈통과 책임 있는 케어로 자란 아이들만 엄선합니다. 가치 있고 소중한 반려묘, 프리미엄 캐터리에서 만나보세요.",
  },
  {
    heroEyebrow: "COZY ENVIRONMENT · HEALTHY COMPANION",
    heroTitle: "당신의 일상에 스며드는 따스한 묘연",
    heroSubtitle:
      "신뢰감 있는 분양 프로세스와 전문적인 품종 안내. 온전히 사랑만 나눌 수 있는 프리미엄 반려묘를 전해드립니다.",
  },
];

const BREED_VARIANTS: Record<string, HeroCopy[]> = {
  네바마스커레이드: NEVA_VARIANTS,
  메인쿤: MAINE_COON_VARIANTS,
  시베리안: SIBERIAN_VARIANTS,
  러시안블루: [
    {
      heroEyebrow: "SILVER ELEGANCE · PREMIUM BREED",
      heroTitle: "은빛 실크 위에 피어난 묘연, 러시안 블루",
      heroSubtitle:
        "에메랄드빛 눈과 차분한 고급스러움. 조용하지만 깊은 애정을 전하는, 품격 있는 프리미엄 반려묘입니다.",
    },
  ],
  브리티시: [
    {
      heroEyebrow: "ROUND CHARM · STEADY HEART",
      heroTitle: "둥근 얼굴이 주는 포근함, 브리티시 숏헤어",
      heroSubtitle:
        "듬직한 체형과 안정적인 성격. 가족과 함께하는 일상에 신뢰와 따스함을 더하는 프리미엄 반려묘입니다.",
    },
  ],
};

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function inferBreedName(keyword: string): string {
  return (
    keyword
      .replace(/분양/g, "")
      .replace(/입양/g, "")
      .replace(
        /인천|서울|수원|부산|대구|광주|대전|울산|경기|강남|분당|일산|김포|안양|안산|시흥|부천|성남|용인|화성|평택|청라|송도|제주|대구|전주|목포|김해|진주|청주|춘천|원주|이천|과천|군포|구미|성남|하남|미사|강동|용산|영등포|송파|잠실|서초|마곡|구리|별내|홍성|동해|태백|마산|홍천|이태원/g,
        ""
      )
      .replace(/고양이|강아지|묘|견/g, "")
      .trim() || keyword
  );
}

export function getBreedUsps(breed: string, keyword: string): string[] {
  for (const [key, usps] of Object.entries(BREED_USP)) {
    if (breed.includes(key) || keyword.includes(key)) {
      return usps;
    }
  }
  return ["프리미엄 혈통", "건강한 케어", "품격 있는 반려묘", "신뢰할 수 있는 분양"];
}

export function pickHeroVariant(breed: string, keyword: string, seed: string): HeroCopy {
  for (const [key, variants] of Object.entries(BREED_VARIANTS)) {
    if (breed.includes(key) || keyword.includes(key)) {
      const index = hashString(seed + key) % variants.length;
      return variants[index];
    }
  }

  const index = hashString(seed + breed) % GENERIC_VARIANTS.length;
  const generic = { ...GENERIC_VARIANTS[index] };
  if (breed) {
    generic.heroTitle = generic.heroTitle.replace("반려묘", breed);
  }
  return generic;
}

export function createVariationSeed(entry: { id: string; keyword: string; updatedAt?: string }): string {
  return `${entry.id}-${entry.keyword}-${entry.updatedAt ?? Date.now()}`;
}

const BREED_NAMES = Object.keys(BREED_USP);

/** 타겟 품종이 아닌 다른 품종명·영문 표기 */
const FOREIGN_BREED_ALIASES: Record<string, string[]> = {
  메인쿤: ["메인쿤", "Maine Coon", "Maine coon", "mainecoon", "main coon"],
  시베리안: ["시베리안", "Siberian", "siberian"],
  러시안블루: ["러시안블루", "러시안 블루", "Russian Blue"],
  브리티시: ["브리티시", "British Shorthair", "브리티시 숏헤어"],
  네바마스커레이드: ["네바마스커레이드", "네바 마스커레이드", "Neva Masquerade"],
};

function resolveTargetBreedKey(breed: string, keyword: string): string {
  for (const key of BREED_NAMES) {
    if (breed.includes(key) || keyword.includes(key)) return key;
  }
  return breed;
}

function getForeignMentions(targetKey: string): string[] {
  const mentions: string[] = [];
  for (const [key, aliases] of Object.entries(FOREIGN_BREED_ALIASES)) {
    if (key === targetKey) continue;
    mentions.push(...aliases);
  }
  return mentions;
}

/** 괄호 안 다른 품종 혼용·타 품종명 제거 */
export function sanitizeBreedText(text: string, breed: string, keyword: string): string {
  if (!text) return text;

  const targetKey = resolveTargetBreedKey(breed, keyword);
  let result = text;

  // "네바마스커레이드(메인쿤)" → "네바마스커레이드"
  result = result.replace(
    /([가-힣a-zA-Z\s]+)\(\s*[^)]+\s*\)/g,
    (match, prefix: string) => {
      const trimmed = prefix.trim();
      if (trimmed.includes(targetKey) || keyword.includes(trimmed.replace(/\s/g, ""))) {
        return trimmed;
      }
      return match;
    }
  );

  for (const foreign of getForeignMentions(targetKey)) {
    if (foreign.length < 2) continue;
    const escaped = foreign.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "gi"), "");
  }

  return result.replace(/\s{2,}/g, " ").replace(/\s+([,.])/g, "$1").trim();
}

export function containsForeignBreed(text: string, breed: string, keyword: string): boolean {
  if (!text) return false;
  const targetKey = resolveTargetBreedKey(breed, keyword);
  return getForeignMentions(targetKey).some((name) =>
    text.toLowerCase().includes(name.toLowerCase())
  );
}

const WEAK_HERO_THEME = /^알러지|^알레르기|^하이포|^분양$|^입양$/;

export function isWeakHeroCopy(text: string | undefined): boolean {
  if (!text?.trim()) return true;
  const t = text.trim();
  if (t.length < 12) return true;
  if (WEAK_HERO_THEME.test(t)) return true;
  if (t.includes("입니다.") || (t.includes("입니다") && t.length < 55 && !t.includes("，"))) {
    return t.includes("알려진") || t.includes("품종입니다");
  }
  return false;
}
