import { NextRequest, NextResponse } from "next/server";
import { hideKeywordsFromAdminBulk } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { storageErrorMessage } from "@/lib/storage";

/** 선택 키워드 관리자 목록에서 제거 (랜딩 페이지 유지) */
export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "삭제할 키워드를 선택해 주세요." }, { status: 400 });
    }

    const hiddenCount = await hideKeywordsFromAdminBulk(ids);
    return NextResponse.json({ success: true, hiddenCount });
  } catch (error) {
    const message = storageErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
