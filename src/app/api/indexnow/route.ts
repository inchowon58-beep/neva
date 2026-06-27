import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllKeywordsRaw } from "@/lib/db";
import { getIndexNowConfigStatus, isIndexNowConfigured, notifyBulkIndexNow } from "@/lib/naver-indexnow";

/** 관리자 — 미전송·24h 경과 URL만 IndexNow 일괄 전송 (초기 1회용) */
export async function POST() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  if (!isIndexNowConfigured()) {
    const status = getIndexNowConfigStatus();
    return NextResponse.json(
      {
        error: "NAVER_INDEXNOW_KEY 또는 NEXT_PUBLIC_SITE_URL이 설정되지 않았습니다.",
        config: status,
      },
      { status: 400 }
    );
  }

  const entries = await getAllKeywordsRaw();
  const result = await notifyBulkIndexNow(entries);

  return NextResponse.json({
    success: result.ok,
    indexNow: result,
    urlCount: result.submitted ?? 0,
    skippedCount: result.skippedCount ?? 0,
    message: result.message,
  });
}
