"use client";

import { useRouter } from "next/navigation";
import type { MainPageLink } from "@/types";

interface MainPageSwitcherProps {
  mainPages: MainPageLink[];
  currentPath?: string;
}

export default function MainPageSwitcher({ mainPages, currentPath }: MainPageSwitcherProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const path = e.target.value;
    if (!path) return;

    if (path.startsWith("http://") || path.startsWith("https://")) {
      window.location.href = path;
      return;
    }

    router.push(path);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <label htmlFor="main-page-switcher" className="shrink-0 text-sm font-medium text-slate-700">
        다른 키워드 랜딩페이지
      </label>
      <select
        id="main-page-switcher"
        defaultValue={currentPath ?? ""}
        onChange={handleChange}
        disabled={mainPages.length === 0}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:max-w-md"
      >
        <option value="">
          {mainPages.length === 0 ? "등록된 페이지 없음" : "페이지 선택"}
        </option>
        {mainPages.map((page) => (
          <option key={page.id} value={page.path}>
            {page.keyword}
          </option>
        ))}
      </select>
    </div>
  );
}
