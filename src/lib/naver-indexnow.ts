const NAVER_INDEXNOW_ENDPOINT = "https://searchadvisor.naver.com/indexnow";

export interface IndexNowResult {
  ok: boolean;
  skipped?: boolean;
  status?: number;
  submitted?: number;
  error?: string;
}

function getSiteBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    return null;
  }
}

export function isIndexNowConfigured(): boolean {
  return Boolean(process.env.NAVER_INDEXNOW_KEY?.trim() && getSiteBaseUrl());
}

export function getIndexNowKeyLocation(): string | null {
  const key = process.env.NAVER_INDEXNOW_KEY?.trim();
  const base = getSiteBaseUrl();
  if (!key || !base) return null;
  return `${base}/${key}.txt`;
}

/** 랜딩 페이지 절대 URL */
export function buildLandingPageUrl(slug: string): string | null {
  const base = getSiteBaseUrl();
  if (!base || !slug?.trim()) return null;
  return `${base}/landing/${encodeURIComponent(slug.trim())}`;
}

/**
 * 네이버 IndexNow — 페이지 갱신 알림
 * @see https://searchadvisor.naver.com/guide/indexnow-request
 */
export async function submitToNaverIndexNow(urls: string[]): Promise<IndexNowResult> {
  const key = process.env.NAVER_INDEXNOW_KEY?.trim();
  const base = getSiteBaseUrl();

  if (!key || !base) {
    return { ok: false, skipped: true, error: "NAVER_INDEXNOW_KEY 또는 NEXT_PUBLIC_SITE_URL 미설정" };
  }

  const uniqueUrls = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  if (uniqueUrls.length === 0) {
    return { ok: true, skipped: true, submitted: 0 };
  }

  const host = new URL(base).host;
  const keyLocation = `${base}/${key}.txt`;

  try {
    const res = await fetch(NAVER_INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList: uniqueUrls.slice(0, 10_000),
      }),
    });

    if (res.ok || res.status === 202) {
      return { ok: true, status: res.status, submitted: uniqueUrls.length };
    }

    const text = await res.text().catch(() => "");
    return {
      ok: false,
      status: res.status,
      submitted: uniqueUrls.length,
      error: text || `IndexNow HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "IndexNow 요청 실패",
    };
  }
}

/** 슬러그 1건 — 키워드 등록·콘텐츠 생성 후 호출 */
export async function notifyLandingPageIndexNow(slug: string): Promise<IndexNowResult> {
  const url = buildLandingPageUrl(slug);
  if (!url) {
    return { ok: false, skipped: true, error: "랜딩 URL 생성 실패" };
  }
  return submitToNaverIndexNow([url]);
}

/** 실패해도 본 작업은 중단하지 않음 */
export async function notifyLandingPageIndexNowSafe(slug: string): Promise<IndexNowResult | null> {
  if (!isIndexNowConfigured()) return null;
  try {
    return await notifyLandingPageIndexNow(slug);
  } catch {
    return { ok: false, error: "IndexNow 알림 중 예외 발생" };
  }
}
