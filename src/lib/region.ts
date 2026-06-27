import { inferBreedName } from "@/lib/hero-copy";

const BREED_NAMES = ["네바마스커레이드", "메인쿤", "시베리안", "러시안블루", "브리티시"];

function extractBreedName(keyword: string): string {
  for (const breed of BREED_NAMES) {
    if (keyword.includes(breed)) return breed;
  }
  const inferred = inferBreedName(keyword);
  return BREED_NAMES.find((b) => inferred.includes(b)) ?? "네바마스커레이드";
}

/** 키워드에서 지역명 추출 (예: 부평네바마스커레이드분양 → 부평) */
export function extractRegionName(keyword: string): string {
  let region = keyword.trim().replace(/\d{2}$/, "");

  const tailPatterns = [
    /네바마스커레이드분양/i,
    /네바마스커레이드/i,
    /메인쿤분양/i,
    /메인쿤/i,
    /시베리안분양/i,
    /시베리안/i,
    /러시안블루분양/i,
    /러시안블루/i,
    /브리티시분양/i,
    /브리티시숏헤어/i,
    /브리티시/i,
    /고양이분양/i,
    /고양이/i,
    /분양/i,
    /입양/i,
  ];

  for (const pattern of tailPatterns) {
    region = region.replace(pattern, "");
  }

  return region.trim();
}

/** 지역별 인근 5개 동·읍·면 (실제 행정구역명) */
const NEARBY_BY_REGION: Record<string, string[]> = {
  부평: ["부개동", "삼산동", "청천동", "부평동", "십정동"],
  부평구: ["부개동", "삼산동", "청천동", "부평동", "십정동"],
  계양: ["계산동", "작전동", "효성동", "병방동", "동양동"],
  계양구: ["계산동", "작전동", "효성동", "병방동", "동양동"],
  인천: ["부평동", "주안동", "연수동", "송도동", "계산동"],
  송도: ["연수동", "동춘동", "청학동", "옥련동", "송도동"],
  연수: ["송도동", "동춘동", "청학동", "옥련동", "연수동"],
  주안: ["관교동", "도화동", "주안동", "신기동", "갈산동"],
  청라: ["청라동", "가정동", "석남동", "가좌동", "경서동"],
  김포: ["장기동", "구래동", "운양동", "사우동", "풍무동"],
  부천: ["중동", "상동", "심곡동", "원미동", "소사동"],
  광명: ["철산동", "하안동", "광명동", "소하동", "일직동"],
  시흥: ["정왕동", "신천동", "은행동", "대야동", "월곶동"],
  안산: ["고잔동", "선부동", "와동", "본오동", "사동"],
  안양: ["평촌동", "호계동", "비산동", "관양동", "석수동"],
  군포: ["산본동", "금정동", "당동", "당정동", "대야동"],
  수원: ["영통동", "매탄동", "권선동", "장안동", "팔달동"],
  영통: ["영통동", "매탄동", "원천동", "하동", "망포동"],
  성남: ["분당동", "정자동", "수내동", "야탑동", "서현동"],
  분당: ["정자동", "수내동", "야탑동", "서현동", "이매동"],
  용인: ["기흥동", "보정동", "죽전동", "동백동", "상현동"],
  기흥: ["기흥동", "보정동", "구갈동", "상갈동", "신갈동"],
  수지: ["죽전동", "동천동", "성복동", "풍덕천동", "고기동"],
  화성: ["병점동", "봉담읍", "향남읍", "동탄동", "오산동"],
  동탄: ["동탄동", "반송동", "능동", "산척동", "장지동"],
  평택: ["비전동", "용이동", "세곡동", "지산동", "합정동"],
  오산: ["원동", "궐동", "양산동", "세마동", "초평동"],
  의정부: ["의정부동", "호원동", "장암동", "신곡동", "가능동"],
  파주: ["금촌동", "운정동", "문산읍", "교하동", "탄현동"],
  고양: ["일산동", "화정동", "행신동", "덕양동", "백석동"],
  일산: ["일산동", "주엽동", "대화동", "백석동", "탄현동"],
  강남: ["역삼동", "삼성동", "논현동", "대치동", "청담동"],
  강동: ["천호동", "길동", "둔촌동", "암사동", "명일동"],
  송파: ["잠실동", "문정동", "가락동", "방이동", "석촌동"],
  잠실: ["잠실동", "신천동", "석촌동", "방이동", "가락동"],
  영등포: ["여의도동", "당산동", "대림동", "신길동", "문래동"],
  마곡: ["마곡동", "염창동", "등촌동", "화곡동", "가양동"],
  구리: ["교문동", "수택동", "인창동", "토평동", "갈매동"],
  하남: ["신장동", "덕풍동", "천현동", "풍산동", "망월동"],
  남양주: ["다산동", "별내동", "화도읍", "금곡동", "와부읍"],
  천안: ["불당동", "두정동", "신방동", "성정동", "쌍용동"],
  대전: ["둔산동", "관평동", "월평동", "용문동", "탄방동"],
  대구: ["수성동", "범어동", "만촌동", "황금동", "두류동"],
  부산: ["해운대동", "센텀동", "연산동", "부전동", "광안동"],
  해운대: ["해운대동", "우동", "중동", "좌동", "재송동"],
  광주: ["봉선동", "치평동", "상무지구", "풍암동", "첨단동"],
  전주: ["효자동", "서신동", "송천동", "전동", "인후동"],
  제주: ["노형동", "연동", "이도동", "애월읍", "한림읍"],
};

const REGION_ALIASES: Record<string, string> = {
  부평네바: "부평",
  인천부평: "부평",
};

function resolveRegionKey(region: string): string | null {
  if (!region) return null;

  if (NEARBY_BY_REGION[region]) return region;

  const alias = REGION_ALIASES[region];
  if (alias && NEARBY_BY_REGION[alias]) return alias;

  const keys = Object.keys(NEARBY_BY_REGION);
  const byContains = keys.find((k) => region.includes(k) || k.includes(region));
  if (byContains) return byContains;

  return null;
}

/** 인근 지역 5개 반환 (매핑 없으면 지역명 기반 안내 문구용 폴백) */
export function getNearbyAreas(keyword: string): {
  region: string;
  areas: string[];
  fromMap: boolean;
} {
  const region = extractRegionName(keyword);
  const key = resolveRegionKey(region);

  if (key) {
    return { region: key, areas: NEARBY_BY_REGION[key].slice(0, 5), fromMap: true };
  }

  if (region.length >= 2) {
    return {
      region,
      areas: [
        `${region} 중심`,
        `${region}역 일대`,
        `${region} 인근`,
        `${region} 생활권`,
        `${region} 주변`,
      ],
      fromMap: false,
    };
  }

  return { region: "", areas: [], fromMap: false };
}

/** H1용 — 키워드(1줄) + 히어로 카피(2줄) 자연스럽게 결합 */
export function buildHeroH1(keyword: string, heroTitle: string): {
  keywordLine: string;
  titleLine: string;
  combined: string;
} {
  const keywordLine = keyword.replace(/\d{2}$/, "").trim();
  const titleLine = heroTitle.trim() || "프리미엄 캐터리에서 만나는 품격 있는 반려묘";

  return {
    keywordLine,
    titleLine,
    combined: `${keywordLine}, ${titleLine}`,
  };
}

export function buildNearbyAreasIntro(
  keyword: string,
  region: string,
  areas: string[]
): string {
  if (areas.length === 0) return "";

  const breed = extractBreedName(keyword) || "네바마스커레이드";
  const areaText = areas.join(", ");

  return (
    `${keyword.replace(/\d{2}$/, "")}를 찾으시는 ${region} 및 인근(${areaText}) 지역 거주자분들께 ` +
    `${breed} 품종 정보와 분양 안내를 제공합니다. ${region} 생활권에서도 전국 안전 인도와 ` +
    `연락처를 통해 편리하게 ${breed} 입양 정보를 확인하실 수 있습니다.`
  );
}
