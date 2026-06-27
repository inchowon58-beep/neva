import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllSlugs } from "@/lib/db";
import { buildLandingPageUrl, isIndexNowConfigured, submitToNaverIndexNow } from "@/lib/naver-indexnow";

/** 관리자 — 등록된 모든 랜딩 URL IndexNow 일괄 전송 */
export async function POST() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  if (!isIndexNowConfigured()) {
    return NextResponse.json(
      { error: "NAVER_INDEXNOW_KEY 또는 NEXT_PUBLIC_SITE_URL이 설정되지 않았습니다." },
      { status: 400 }
    );
  }

  const slugs = await getAllSlugs();
  const urls = slugs.map((slug) => buildLandingPageUrl(slug)).filter((url): url is string => Boolean(url));

  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (base) {
    urls.unshift(base);
  }

  const result = await submitToNaverIndexNow(urls);

  return NextResponse.json({
    success: result.ok,
    indexNow: result,
    urlCount: urls.length,
  });
}
