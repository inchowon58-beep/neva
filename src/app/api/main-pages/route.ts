import { NextRequest, NextResponse } from "next/server";
import {
  createMainPage,
  deleteMainPage,
  getAllMainPages,
  updateMainPage,
} from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const mainPages = await getAllMainPages();
  return NextResponse.json({ mainPages });
}

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const { keyword, path } = await request.json();

    if (!keyword?.trim() || !path?.trim()) {
      return NextResponse.json({ error: "키워드와 경로는 필수입니다." }, { status: 400 });
    }

    const entry = await createMainPage({ keyword, path });
    return NextResponse.json({ mainPage: entry }, { status: 201 });
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
    const { id, keyword, path } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다." }, { status: 400 });
    }

    const entry = await updateMainPage(id, { keyword, path });
    return NextResponse.json({ mainPage: entry });
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

    await deleteMainPage(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "삭제 실패";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
