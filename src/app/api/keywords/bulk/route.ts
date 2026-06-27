import { NextRequest, NextResponse } from "next/server";
import { deleteKeywordsBulk } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { storageErrorMessage } from "@/lib/storage";

/** 선택 키워드 일괄 삭제 */
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

    const deletedCount = await deleteKeywordsBulk(ids);
    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    const message = storageErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
