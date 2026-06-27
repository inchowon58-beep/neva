import { NextRequest, NextResponse } from "next/server";
import { getKeywordById, saveGeneratedContent } from "@/lib/db";
import { generateLandingContent, getDefaultContent } from "@/lib/gemini";
import { isAuthenticated } from "@/lib/auth";
import { notifyKeywordIndexNow } from "@/lib/naver-indexnow";
import { storageErrorMessage } from "@/lib/storage";

/** Gemini 호출 + Blob 저장 (Pro 최대 5분, Hobby는 플랜 한도 적용) */
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다." }, { status: 400 });
    }

    const entry = await getKeywordById(id);
    if (!entry) {
      return NextResponse.json({ error: "키워드를 찾을 수 없습니다." }, { status: 404 });
    }

    let content;
    let usedFallback = false;
    try {
      content = await generateLandingContent(entry);
    } catch (genError) {
      console.error("[generate] Gemini failed, using default content:", genError);
      content = getDefaultContent(entry);
      usedFallback = true;
    }

    const updated = await saveGeneratedContent(id, content);
    const indexNow = await notifyKeywordIndexNow(updated, "content_generate");

    return NextResponse.json({
      keyword: updated,
      indexNow,
      usedFallback,
      message: usedFallback
        ? "기본 SEO 콘텐츠가 저장되었습니다. (Gemini API 확인 필요)"
        : "Gemini AI 콘텐츠가 생성되었습니다.",
    });
  } catch (error) {
    console.error("[generate] error:", error);
    const message = storageErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
