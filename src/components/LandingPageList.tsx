"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SAMPLE_SLUG, formatDate } from "@/lib/constants";
import { formatNaverRank, resolveNaverSearchUrl } from "@/lib/naver-search";
import type { NaverShowcase } from "@/types";

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
  showcases: NaverShowcase[];
}

export default function LandingPageList({ showcases: initialShowcases }: LandingPageListProps) {
  const [showcases, setShowcases] = useState(initialShowcases);

  useEffect(() => {
    fetch("/api/public/showcases", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.showcases)) {
          setShowcases(data.showcases);
        }
      })
      .catch(() => {
        /* SSR 데이터 유지 */
      });
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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

      {showcases.map((item) => (
        <ShowcaseCard key={item.id} item={item} />
      ))}
    </div>
  );
}
