/** 네이버 통합검색(웹) URL */
export function buildNaverSearchUrl(keyword: string): string {
  const q = keyword.trim();
  return `https://search.naver.com/search.naver?where=web&query=${encodeURIComponent(q)}`;
}

export function resolveNaverSearchUrl(keyword: string, customUrl?: string): string {
  const trimmed = customUrl?.trim();
  if (trimmed) return trimmed;
  return buildNaverSearchUrl(keyword);
}

/** 순위 표시 (1 → 1위) */
export function formatNaverRank(rank: number): string {
  const n = Math.max(1, Math.floor(rank) || 1);
  return `${n}위`;
}
