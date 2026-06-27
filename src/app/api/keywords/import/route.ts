import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { createKeywordsBulk, markIndexNowSubmitted } from "@/lib/db";
import { MAX_KEYWORD_IMPORT, parseKeywordTxt } from "@/lib/keyword-import";
import type { KeywordBulkDefaults } from "@/types";
import {
  buildLandingPageUrl,
  isIndexNowConfigured,
  submitToNaverIndexNow,
} from "@/lib/naver-indexnow";

interface ImportDefaults {
  companyName?: string;
  imageUrl?: string;
  homepageUrl?: string;
  phone?: string;
  pagePrompt?: string;
}

function resolveDefaults(body: ImportDefaults): KeywordBulkDefaults {
  return {
    companyName: body.companyName?.trim() ?? "",
    imageUrl: body.imageUrl?.trim() ?? "",
    homepageUrl: body.homepageUrl?.trim() ?? "",
    phone: body.phone?.trim() ?? "",
    pagePrompt: body.pagePrompt?.trim() ?? "",
  };
}

/** txt / 키워드 배열 일괄 등록 + IndexNow 1회 배치 전송 */
export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";

    let keywordLines: string[] = [];
    let defaults: KeywordBulkDefaults = {
      companyName: "",
      imageUrl: "",
      homepageUrl: "",
      phone: "",
      pagePrompt: "",
    };
    let sendIndexNow = true;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      defaults = resolveDefaults({
        companyName: String(formData.get("companyName") ?? ""),
        imageUrl: String(formData.get("imageUrl") ?? ""),
        homepageUrl: String(formData.get("homepageUrl") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        pagePrompt: String(formData.get("pagePrompt") ?? ""),
      });
      sendIndexNow = formData.get("sendIndexNow") !== "false";

      if (file instanceof File) {
        const text = await file.text();
        keywordLines = parseKeywordTxt(text);
      } else {
        const text = String(formData.get("text") ?? "");
        keywordLines = parseKeywordTxt(text);
      }
    } else {
      const body = await request.json();
      defaults = resolveDefaults(body);
      sendIndexNow = body.sendIndexNow !== false;

      if (typeof body.text === "string") {
        keywordLines = parseKeywordTxt(body.text);
      } else if (Array.isArray(body.keywords)) {
        keywordLines = body.keywords.map((k: unknown) => String(k).trim()).filter(Boolean);
      }
    }

    if (keywordLines.length === 0) {
      return NextResponse.json({ error: "등록할 키워드가 없습니다." }, { status: 400 });
    }

    if (keywordLines.length > MAX_KEYWORD_IMPORT) {
      return NextResponse.json(
        {
          error: `한 번에 최대 ${MAX_KEYWORD_IMPORT}개까지 등록할 수 있습니다. (현재 ${keywordLines.length}개)`,
        },
        { status: 400 }
      );
    }

    const { created } = await createKeywordsBulk(keywordLines, defaults);

    let indexNow = null;
    if (sendIndexNow && isIndexNowConfigured() && created.length > 0) {
      const urls = created
        .map((e) => buildLandingPageUrl(e.slug))
        .filter((url): url is string => Boolean(url));
      indexNow = await submitToNaverIndexNow(urls);
      if (indexNow.ok && !indexNow.skipped) {
        await Promise.all(created.map((e) => markIndexNowSubmitted(e.id)));
      }
    }

    return NextResponse.json({
      success: true,
      createdCount: created.length,
      keywords: created,
      indexNow,
      message: `${created.length}개 키워드 등록 완료`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "일괄 등록 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
