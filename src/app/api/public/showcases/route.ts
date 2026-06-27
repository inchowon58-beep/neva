import { NextResponse } from "next/server";
import { getNaverShowcasesForMain } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const showcases = await getNaverShowcasesForMain();
  return NextResponse.json(
    { showcases },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
