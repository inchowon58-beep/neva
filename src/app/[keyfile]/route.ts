import { NextResponse } from "next/server";

/** IndexNow 키 검증 파일 — https://도메인/{키}.txt */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ keyfile: string }> }
) {
  const { keyfile } = await params;
  const key = process.env.NAVER_INDEXNOW_KEY?.trim();

  if (!key || keyfile !== `${key}.txt`) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(key, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
