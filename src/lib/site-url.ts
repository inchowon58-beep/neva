/** NEXT_PUBLIC_SITE_URL / SITE_URL → trailing slash 없는 origin (예: https://neva.dmcmusic.co.kr) */
export function getSiteBaseUrl(): string {
  const candidates = [process.env.NEXT_PUBLIC_SITE_URL, process.env.SITE_URL].filter(
    (v): v is string => Boolean(v?.trim())
  );

  for (const raw of candidates) {
    const trimmed = raw.trim();
    try {
      const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      return new URL(normalized).origin;
    } catch {
      continue;
    }
  }

  return "https://example.com";
}

export function landingPageUrl(slug: string, baseUrl = getSiteBaseUrl()): string {
  return `${baseUrl}/landing/${encodeURIComponent(slug)}`;
}
