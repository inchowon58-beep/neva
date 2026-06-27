import { NextRequest, NextResponse } from "next/server";
import { deleteKeywordBySlug } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { parseLandingPageInput } from "@/lib/landing-url";
import { storageErrorMessage } from "@/lib/storage";

/** 페이지 URL(또는 슬러그)로 랜딩 페이지 영구 삭제 */
export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const url = typeof body.url === "string" ? body.url : "";

    const slug = parseLandingPageInput(url);
    if (!slug) {
      return NextResponse.json(
        { error: "올바른 페이지 주소를 입력해 주세요. (예: /landing/슬러그 또는 전체 URL)" },
        { status: 400 }
      );
    }

    const removed = await deleteKeywordBySlug(slug);
    return NextResponse.json({
      success: true,
      slug: removed.slug,
      keyword: removed.keyword,
    });
  } catch (error) {
    const message = storageErrorMessage(error);
    const status = message.includes("찾을 수 없") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
