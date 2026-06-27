"use client";

import { useEffect, useState } from "react";
import {
  formatStatNumber,
  getTodayVisitorCount,
} from "@/lib/main-stats";

interface MainStatsBannerProps {
  todayPublishCount: number;
  yesterdayPublishCount: number;
}

export default function MainStatsBanner({
  todayPublishCount,
  yesterdayPublishCount,
}: MainStatsBannerProps) {
  const [visitors, setVisitors] = useState(() => getTodayVisitorCount());

  useEffect(() => {
    const tick = () => setVisitors(getTodayVisitorCount());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="border-b border-slate-800/50 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
          <p className="text-lg font-bold sm:text-xl">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent">
              오늘발행등록 총 {formatStatNumber(todayPublishCount)}건
            </span>
          </p>
          <p className="text-base font-semibold text-emerald-300 sm:text-lg">
            어제발행등록 {formatStatNumber(yesterdayPublishCount)}건
          </p>
          <p className="text-base font-semibold text-sky-300 sm:text-lg">
            금일방문객 {formatStatNumber(visitors)}명
          </p>
        </div>
      </div>
    </section>
  );
}
