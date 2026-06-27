import type { KeywordEntry } from "@/types";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** UTC Date → KST 시각을 UTC getter로 읽을 수 있는 Date */
export function toKstDate(now = new Date()): Date {
  return new Date(now.getTime() + KST_OFFSET_MS);
}

export function kstDateKey(now = new Date()): string {
  const kst = toKstDate(now);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function kstYesterdayKey(now = new Date()): string {
  const kst = toKstDate(now);
  kst.setUTCDate(kst.getUTCDate() - 1);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function seededUnit(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 10000) / 10000;
}

export function seededInt(seed: string, min: number, max: number): number {
  return min + Math.floor(seededUnit(seed) * (max - min + 1));
}

export function countTodayPublishRegistrations(
  keywords: KeywordEntry[],
  now = new Date()
): number {
  const today = kstDateKey(now);
  return keywords.filter((k) => kstDateKey(new Date(k.createdAt)) === today).length;
}

export function getYesterdayPublishCount(now = new Date()): number {
  return seededInt(`${kstYesterdayKey(now)}-publish`, 500, 1200);
}

function smoothDayProgress(now = new Date()): number {
  const kst = toKstDate(now);
  const minutes =
    kst.getUTCHours() * 60 + kst.getUTCMinutes() + kst.getUTCSeconds() / 60;
  const linear = Math.min(1, Math.max(0, minutes / (24 * 60)));
  return linear * linear * (3 - 2 * linear);
}

export function getDailyVisitorTarget(now = new Date()): number {
  return seededInt(`${kstDateKey(now)}-visitors`, 1200, 1600);
}

export function getTodayVisitorCount(now = new Date()): number {
  const target = getDailyVisitorTarget(now);
  return Math.floor(target * smoothDayProgress(now));
}

export function formatStatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}
