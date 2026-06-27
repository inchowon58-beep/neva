import { NextRequest, NextResponse } from "next/server";
import {
  createNaverShowcase,
  deleteNaverShowcase,
  getAllNaverShowcases,
  getSiteSettings,
  updateNaverShowcase,
} from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { storageErrorMessage } from "@/lib/storage";

export async function GET() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const showcases = await getAllNaverShowcases();
  const settings = await getSiteSettings();
  return NextResponse.json({ showcases, settings });
}

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const entry = await createNaverShowcase({
      keyword: body.keyword,
      companyName: body.companyName,
      displayDate: body.displayDate,
      rank: body.rank,
      naverSearchUrl: body.naverSearchUrl,
    });
    return NextResponse.json({ showcase: entry }, { status: 201 });
  } catch (error) {
    const message = storageErrorMessage(error);
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
    if (!body.id) {
      return NextResponse.json({ error: "ID가 필요합니다." }, { status: 400 });
    }

    const entry = await updateNaverShowcase(body.id, {
      keyword: body.keyword,
      companyName: body.companyName,
      displayDate: body.displayDate,
      rank: body.rank,
      naverSearchUrl: body.naverSearchUrl,
    });
    return NextResponse.json({ showcase: entry });
  } catch (error) {
    const message = storageErrorMessage(error);
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

    await deleteNaverShowcase(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = storageErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
