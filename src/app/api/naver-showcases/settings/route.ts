import { NextRequest, NextResponse } from "next/server";
import { updateMainShowcaseDisplayCount } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { storageErrorMessage } from "@/lib/storage";

export async function PUT(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const settings = await updateMainShowcaseDisplayCount(body.displayCount);
    return NextResponse.json({ settings });
  } catch (error) {
    const message = storageErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
