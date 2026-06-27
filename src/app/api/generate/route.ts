import { NextRequest, NextResponse } from "next/server";
import { getKeywordById, saveGeneratedContent } from "@/lib/db";
import { generateLandingContent, getDefaultContent } from "@/lib/gemini";
import { isAuthenticated } from "@/lib/auth";

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
    try {
      content = await generateLandingContent(entry);
    } catch {
      content = getDefaultContent(entry);
    }

    const updated = await saveGeneratedContent(id, content);
    return NextResponse.json({ keyword: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "콘텐츠 생성 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
