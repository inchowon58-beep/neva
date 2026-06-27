import { NextRequest, NextResponse } from "next/server";
import { getKeywordBySlug, saveGeneratedContent } from "@/lib/db";
import { generateLandingContent, getDefaultContent } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: "slug가 필요합니다." }, { status: 400 });
    }

    const entry = await getKeywordBySlug(slug);
    if (!entry) {
      return NextResponse.json({ error: "페이지를 찾을 수 없습니다." }, { status: 404 });
    }

    if (entry.generatedContent) {
      return NextResponse.json({ keyword: entry });
    }

    let content;
    try {
      content = await generateLandingContent(entry);
    } catch {
      content = getDefaultContent(entry);
    }

    const updated = await saveGeneratedContent(entry.id, content);
    return NextResponse.json({ keyword: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "콘텐츠 생성 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
