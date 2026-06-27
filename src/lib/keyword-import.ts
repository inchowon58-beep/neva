/** txt 한 줄 = 키워드 1개 (빈 줄·# 주석 제외) */
export function parseKeywordTxt(content: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const keyword = trimmed.split(/[\t,|]/)[0]?.trim() ?? "";
    if (!keyword) continue;

    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(keyword);
  }

  return result;
}

export const MAX_KEYWORD_IMPORT = 1000;
