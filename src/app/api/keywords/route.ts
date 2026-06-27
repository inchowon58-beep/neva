import { NextRequest, NextResponse } from "next/server";
import {
  createKeyword,
  deleteKeyword,
  getAllKeywords,
  getKeywordById,
  updateKeyword,
} from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { notifyKeywordIndexNow } from "@/lib/naver-indexnow";

export async function GET() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const keywords = await getAllKeywords();
  return NextResponse.json({ keywords });
}

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { keyword, companyName, imageUrl, homepageUrl, phone, pagePrompt } = body;

    if (!keyword?.trim()) {
      return NextResponse.json({ error: "키워드는 필수입니다." }, { status: 400 });
    }

    const entry = await createKeyword({
      keyword,
      companyName: companyName || "",
      imageUrl: imageUrl || "",
      homepageUrl: homepageUrl || "",
      phone: phone || "",
      pagePrompt: pagePrompt || "",
    });

    const indexNow = await notifyKeywordIndexNow(entry, "create");

    return NextResponse.json({ keyword: entry, indexNow }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "등록 실패";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, keyword, companyName, imageUrl, homepageUrl, phone, pagePrompt } = body;

    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다." }, { status: 400 });
    }

    const previous = await getKeywordById(id);
    if (!previous) {
      return NextResponse.json({ error: "키워드를 찾을 수 없습니다." }, { status: 404 });
    }

    const entry = await updateKeyword(id, {
      keyword,
      companyName,
      imageUrl,
      homepageUrl,
      phone,
      pagePrompt,
    });
    const indexNow = await notifyKeywordIndexNow(entry, "slug_change", {
      previousSlug: previous.slug,
    });
    return NextResponse.json({ keyword: entry, indexNow });
  } catch (error) {
    const message = error instanceof Error ? error.message : "수정 실패";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다." }, { status: 400 });
    }

    await deleteKeyword(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "삭제 실패";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
