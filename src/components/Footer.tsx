"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteBusinessFooter from "@/components/SiteBusinessFooter";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/landing")) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between">
        <SiteBusinessFooter variant="light" />
        <Link
          href="/admin"
          className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
        >
          로그인
        </Link>
      </div>
    </footer>
  );
}
