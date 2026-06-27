/** 관리자 입력(전체 URL, /landing/slug, slug)에서 슬러그 추출 */
export function parseLandingPageInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const match = url.pathname.match(/\/landing\/([^/]+)\/?$/);
      if (match) {
        try {
          return decodeURIComponent(match[1]);
        } catch {
          return match[1];
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  const pathMatch = trimmed.match(/(?:^|\/)landing\/([^/\s?#]+)/);
  if (pathMatch) {
    try {
      return decodeURIComponent(pathMatch[1]);
    } catch {
      return pathMatch[1];
    }
  }

  if (!trimmed.includes("/") && /^[\w\uAC00-\uD7A3-]+$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}
