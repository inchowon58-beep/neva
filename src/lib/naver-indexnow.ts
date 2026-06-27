import type { KeywordEntry } from "@/types";
import { markIndexNowSubmitted } from "@/lib/db";

const NAVER_INDEXNOW_ENDPOINT = "https://searchadvisor.naver.com/indexnow";

/** 같은 URL 재전송 최소 간격 (네이버 권장: 매일 반복 불필요) */
export const INDEXNOW_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export type IndexNowTrigger = "create" | "content_generate" | "slug_change" | "bulk";

export interface IndexNowResult {
  ok: boolean;
  skipped?: boolean;
  status?: number;
  submitted?: number;
  skippedCount?: number;
  error?: string;
  message?: string;
}

function getSiteUrlCandidates(): string[] {
  return [process.env.NEXT_PUBLIC_SITE_URL, process.env.SITE_URL].filter((v): v is string =>
    Boolean(v?.trim())
  );
}

function getSiteBaseUrl(): string | null {
  for (const raw of getSiteUrlCandidates()) {
    const trimmed = raw.trim();
    try {
      const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      return new URL(normalized).origin;
    } catch {
      continue;
    }
  }
  return null;
}

export function getIndexNowConfigStatus() {
  const key = process.env.NAVER_INDEXNOW_KEY?.trim() || "";
  const base = getSiteBaseUrl();
  return {
    hasKey: Boolean(key),
    hasSiteUrl: Boolean(base),
    siteUrl: base,
    keyPreview: key ? `${key.slice(0, 4)}…${key.slice(-4)}` : null,
  };
}

export function isIndexNowConfigured(): boolean {
  const { hasKey, hasSiteUrl } = getIndexNowConfigStatus();
  return hasKey && hasSiteUrl;
}

export function getIndexNowKeyLocation(): string | null {
  const key = process.env.NAVER_INDEXNOW_KEY?.trim();
  const base = getSiteBaseUrl();
  if (!key || !base) return null;
  return `${base}/${key}.txt`;
}

export function buildLandingPageUrl(slug: string): string | null {
  const base = getSiteBaseUrl();
  if (!base || !slug?.trim()) return null;
  return `${base}/landing/${encodeURIComponent(slug.trim())}`;
}

export function isWithinIndexNowCooldown(submittedAt: string | null | undefined): boolean {
  if (!submittedAt) return false;
  const elapsed = Date.now() - new Date(submittedAt).getTime();
  return elapsed >= 0 && elapsed < INDEXNOW_COOLDOWN_MS;
}

function skipResult(message: string): IndexNowResult {
  return { ok: true, skipped: true, message };
}

export function shouldNotifyIndexNow(
  entry: KeywordEntry,
  trigger: IndexNowTrigger,
  options?: { previousSlug?: string }
): { notify: boolean; reason?: string } {
  if (!isIndexNowConfigured()) {
    return { notify: false, reason: "IndexNow 미설정" };
  }

  switch (trigger) {
    case "create":
      return { notify: true };
    case "slug_change":
      if (options?.previousSlug && options.previousSlug !== entry.slug) {
        return { notify: true };
      }
      return { notify: false, reason: "슬러그 변경 없음 — IndexNow 생략" };
    case "content_generate":
      if (isWithinIndexNowCooldown(entry.indexNowSubmittedAt)) {
        return { notify: false, reason: "24시간 내 이미 전송됨 — IndexNow 생략" };
      }
      return { notify: true };
    case "bulk":
      if (isWithinIndexNowCooldown(entry.indexNowSubmittedAt)) {
        return { notify: false, reason: "24시간 내 이미 전송됨" };
      }
      return { notify: true };
    default:
      return { notify: false };
  }
}

export async function submitToNaverIndexNow(urls: string[]): Promise<IndexNowResult> {
  const key = process.env.NAVER_INDEXNOW_KEY?.trim();
  const base = getSiteBaseUrl();

  if (!key || !base) {
    return { ok: false, skipped: true, error: "NAVER_INDEXNOW_KEY 또는 NEXT_PUBLIC_SITE_URL 미설정" };
  }

  const uniqueUrls = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  if (uniqueUrls.length === 0) {
    return { ok: true, skipped: true, submitted: 0, message: "전송할 URL 없음" };
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
      return {
        ok: true,
        status: res.status,
        submitted: uniqueUrls.length,
        message: "네이버 IndexNow 알림 완료",
      };
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

/** 키워드 1건 — 트리거별 자동/중복 방지 */
export async function notifyKeywordIndexNow(
  entry: KeywordEntry,
  trigger: IndexNowTrigger,
  options?: { previousSlug?: string }
): Promise<IndexNowResult | null> {
  if (!isIndexNowConfigured()) return null;

  const decision = shouldNotifyIndexNow(entry, trigger, options);
  if (!decision.notify) {
    return skipResult(decision.reason ?? "IndexNow 생략");
  }

  const url = buildLandingPageUrl(entry.slug);
  if (!url) {
    return { ok: false, skipped: true, error: "랜딩 URL 생성 실패" };
  }

  const result = await submitToNaverIndexNow([url]);
  if (result.ok && !result.skipped) {
    await markIndexNowSubmitted(entry.id);
  }
  return result;
}

/** 일괄 전송 — 24시간 내 전송된 URL 제외 */
export async function notifyBulkIndexNow(entries: KeywordEntry[]): Promise<IndexNowResult> {
  if (!isIndexNowConfigured()) {
    return { ok: false, skipped: true, error: "NAVER_INDEXNOW_KEY 또는 NEXT_PUBLIC_SITE_URL 미설정" };
  }

  const toSubmit: KeywordEntry[] = [];
  let skippedCount = 0;

  for (const entry of entries) {
    const decision = shouldNotifyIndexNow(entry, "bulk");
    if (decision.notify) {
      toSubmit.push(entry);
    } else {
      skippedCount++;
    }
  }

  const urls = toSubmit
    .map((e) => buildLandingPageUrl(e.slug))
    .filter((url): url is string => Boolean(url));

  if (urls.length === 0) {
    return {
      ok: true,
      skipped: true,
      skippedCount,
      submitted: 0,
      message:
        skippedCount > 0
          ? `전송 대상 없음 (${skippedCount}개는 24시간 내 이미 전송됨)`
          : "전송할 URL 없음",
    };
  }

  const result = await submitToNaverIndexNow(urls);
  if (result.ok && !result.skipped) {
    await Promise.all(toSubmit.map((e) => markIndexNowSubmitted(e.id)));
  }

  return {
    ...result,
    skippedCount,
    message: result.ok
      ? `IndexNow ${urls.length}개 전송${skippedCount > 0 ? ` · ${skippedCount}개 생략(24h)` : ""}`
      : result.error,
  };
}
