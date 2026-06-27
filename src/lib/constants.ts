export const MAIN_KEYWORD = "네바마스커레이드분양";
export const MAIN_TITLE = "네바마스커레이드";
export const RECENT_KEYWORDS_LIMIT = 50;
export const SAMPLE_SLUG = "sample-design";

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
