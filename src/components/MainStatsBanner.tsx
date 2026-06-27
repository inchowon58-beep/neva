"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatStatNumber,
  getTodayVisitorCount,
  getTodayVisitorStartOffset,
} from "@/lib/main-stats";

interface MainStatsBannerProps {
  yesterdayPublishCount: number;
}

export default function MainStatsBanner({ yesterdayPublishCount }: MainStatsBannerProps) {
  const [visitors, setVisitors] = useState(() =>
    Math.max(0, getTodayVisitorCount() - getTodayVisitorStartOffset())
  );
  const visitorsRef = useRef(visitors);

  useEffect(() => {
    visitorsRef.current = visitors;
  }, [visitors]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleTick = () => {
      const delayMs = 1800 + Math.random() * 5200;
      timeoutId = setTimeout(() => {
        const cap = getTodayVisitorCount();
        const current = visitorsRef.current;

        if (current < cap) {
          if (Math.random() < 0.38) {
            scheduleTick();
            return;
          }
          const bump = Math.random() < 0.72 ? 1 : 2;
          setVisitors(Math.min(cap, current + bump));
        }

        scheduleTick();
      }, delayMs);
    };

    scheduleTick();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <section className="border-b border-slate-800/50 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-x-12">
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
