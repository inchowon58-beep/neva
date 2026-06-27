"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SAMPLE_SLUG, formatDate } from "@/lib/constants";
import type { KeywordEntry } from "@/types";

const DESKTOP_PAGE_SIZE = 15;
const MOBILE_PAGE_SIZE = 14;
const DESKTOP_BREAKPOINT = 1024;

interface LandingPageListProps {
  keywords: KeywordEntry[];
}

export default function LandingPageList({ keywords }: LandingPageListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE);

  const updatePageSize = useCallback(() => {
    setPageSize(window.innerWidth >= DESKTOP_BREAKPOINT ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE);
  }, []);

  useEffect(() => {
    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, [updatePageSize]);

  const firstPageKeywordCount = pageSize - 1;
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
            <p className="mt-2 text-xs text-emerald-600 lg:mt-3">클릭하여 디자인 샘플을 확인하세요</p>
          </Link>
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
