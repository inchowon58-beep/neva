"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SiteBusinessFooter from "@/components/SiteBusinessFooter";

export default function Footer() {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/login")
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data) => {
        setAuthenticated(Boolean(data.authenticated));
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    window.location.href = "/";
  };

  if (pathname.startsWith("/admin") || pathname.startsWith("/landing")) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between">
        <SiteBusinessFooter variant="light" />
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
          <Link
            href="/admin"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          >
            관리자페이지
          </Link>
          {authChecked &&
            (authenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/admin"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                로그인
              </Link>
            ))}
        </div>
      </div>
    </footer>
  );
}
