import { NextRequest, NextResponse } from "next/server";
import {
  createKeyword,
  deleteKeyword,
  deleteKeywordsBulk,
  getAllKeywords,
  getKeywordById,
  updateKeyword,
} from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { notifyKeywordIndexNow } from "@/lib/naver-indexnow";
import { ADMIN_KEYWORD_LIST_MAX } from "@/lib/constants";
import { storageErrorMessage } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const lite = request.nextUrl.searchParams.get("lite") === "1";
  const all = await getAllKeywords();
  const keywords = all.slice(0, ADMIN_KEYWORD_LIST_MAX);

  if (lite) {
    return NextResponse.json({
      keywords: keywords.map((k) => ({
        id: k.id,
        slug: k.slug,
        keyword: k.keyword,
        companyName: k.companyName,
        imageUrl: k.imageUrl,
        homepageUrl: k.homepageUrl,
        phone: k.phone,
        pagePrompt: k.pagePrompt,
        contentGeneratedAt: k.contentGeneratedAt,
        indexNowSubmittedAt: k.indexNowSubmittedAt,
        createdAt: k.createdAt,
        updatedAt: k.updatedAt,
        hasContent: Boolean(k.generatedContent || k.contentGeneratedAt),
      })),
      total: all.length,
    });
  }

  return NextResponse.json({ keywords, total: all.length });
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
    const message = storageErrorMessage(error);
    const status = message.includes("Blob Storage") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
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
    const message = storageErrorMessage(error);
    const status = message.includes("Blob Storage") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
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
    const message = storageErrorMessage(error);
    const status = message.includes("Blob Storage") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
