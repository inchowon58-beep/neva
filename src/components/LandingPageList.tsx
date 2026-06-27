"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SAMPLE_SLUG, formatDate } from "@/lib/constants";
import { formatNaverRank, resolveNaverSearchUrl } from "@/lib/naver-search";
import type { KeywordEntry, NaverShowcase } from "@/types";

const DESKTOP_PAGE_SIZE = 15;
const MOBILE_PAGE_SIZE = 14;
const DESKTOP_BREAKPOINT = 1024;

function NaverLogoMark() {
  return (
    <span
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-white text-[9px] font-black leading-none text-[#03C75A]"
      aria-hidden
    >
      N
    </span>
  );
}

function ShowcaseCard({ item }: { item: NaverShowcase }) {
  const searchUrl = resolveNaverSearchUrl(item.keyword, item.naverSearchUrl);

  return (
    <article className="flex flex-col rounded-xl border-2 border-[#03C75A]/40 bg-gradient-to-b from-[#f0faf4] to-white p-4 transition hover:border-[#03C75A] hover:shadow-md lg:p-6">
      <div className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-[#03C75A] px-2.5 py-0.5 text-[10px] font-bold text-white lg:text-xs">
        <NaverLogoMark />
        네이버 노출순위 {formatNaverRank(item.rank)}
      </div>
      <h3 className="text-sm font-bold text-slate-900 lg:text-base">{item.keyword}</h3>
      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500 lg:mt-3">
        <span>{formatDate(item.displayDate)}</span>
        {item.companyName && (
          <>
            <span>·</span>
            <span>{item.companyName}</span>
          </>
        )}
      </div>
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#03C75A] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#02b351] lg:mt-4 lg:text-sm"
      >
        <NaverLogoMark />
        네이버 순위 확인
      </a>
    </article>
  );
}

interface LandingPageListProps {
  keywords: KeywordEntry[];
  showcases?: NaverShowcase[];
}

export default function LandingPageList({
  keywords,
  showcases = [],
}: LandingPageListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE);

  const showcaseCount = showcases.length;

  const updatePageSize = useCallback(() => {
    setPageSize(window.innerWidth >= DESKTOP_BREAKPOINT ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE);
  }, []);

  useEffect(() => {
    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, [updatePageSize]);

  const firstPageKeywordCount = Math.max(0, pageSize - 1 - showcaseCount);

  const totalPages = useMemo(() => {
    if (keywords.length <= firstPageKeywordCount) return 1;
    const remaining = keywords.length - firstPageKeywordCount;
    return 1 + Math.ceil(remaining / pageSize);
  }, [keywords.length, pageSize, firstPageKeywordCount]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedKeywords = useMemo(() => {
    if (currentPage === 1) {
      return keywords.slice(0, firstPageKeywordCount);
    }
    const start = firstPageKeywordCount + (currentPage - 2) * pageSize;
    return keywords.slice(start, start + pageSize);
  }, [keywords, currentPage, pageSize, firstPageKeywordCount]);

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {currentPage === 1 && (
          <>
            <Link
              href={`/landing/${SAMPLE_SLUG}`}
              className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 transition hover:border-emerald-400 hover:shadow-md lg:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                노출페이지 디자인
              </p>
              <h3 className="mt-1 text-sm font-semibold text-emerald-900 lg:text-base">
                샘플 페이지 미리보기
              </h3>
              <p className="mt-2 text-xs text-emerald-700 lg:text-sm">/landing/{SAMPLE_SLUG}</p>
              <p className="mt-2 text-xs text-emerald-600 lg:mt-3">
                클릭하여 디자인 샘플을 확인하세요
              </p>
            </Link>

            {showcases.map((item) => (
              <ShowcaseCard key={item.id} item={item} />
            ))}
          </>
        )}

        {paginatedKeywords.map((entry) => (
          <Link
            key={entry.id}
            href={`/landing/${encodeURIComponent(entry.slug)}`}
            className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:shadow-md lg:p-6"
          >
            <h3 className="text-sm font-semibold text-slate-900 lg:text-base">{entry.keyword}</h3>
            <p className="mt-2 text-xs text-blue-600 lg:text-sm">/landing/{entry.slug}</p>
            <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500 lg:mt-3">
              <span>{formatDate(entry.createdAt)}</span>
              {entry.companyName && (
                <>
                  <span>·</span>
                  <span>{entry.companyName}</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="페이지 이동">
          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => {
                setCurrentPage(page);
                document.getElementById("landing-list")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`min-h-10 min-w-10 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                currentPage === page
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {page}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
