"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface LandingNavItem {
  id: string;
  label: string;
}

interface LandingHeaderProps {
  companyName: string;
  keyword: string;
  showGallery?: boolean;
  showNearby?: boolean;
}

function buildNavItems(showGallery: boolean, showNearby: boolean): LandingNavItem[] {
  const items: LandingNavItem[] = [
    { id: "section-about", label: "소개" },
    { id: "section-breed", label: "품종 정보" },
    { id: "section-cattery", label: "캐터리" },
  ];

  if (showGallery) {
    items.push({ id: "section-gallery", label: "갤러리" });
  }

  items.push({ id: "section-contact", label: "연락처" });

  if (showNearby) {
    items.push({ id: "section-nearby", label: "인근 지역" });
  }

  return items;
}

export default function LandingHeader({
  companyName,
  keyword,
  showGallery = true,
  showNearby = true,
}: LandingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = useMemo(
    () => buildNavItems(showGallery, showNearby),
    [showGallery, showNearby]
  );

  const scrollToSection = useCallback((id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e0d4]/80 bg-[#faf8f5]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:py-4">
        <button
          type="button"
          onClick={() => scrollToSection("section-hero")}
          className="min-w-0 text-left"
        >
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8b7355]">
            {companyName}
          </p>
          <p className="truncate font-serif text-base text-[#2c2420] sm:text-lg">{keyword}</p>
        </button>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="페이지 메뉴">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="rounded-lg px-3 py-2 text-xs font-medium tracking-wide text-[#6b5d4d] transition hover:bg-[#e8e0d4]/50 hover:text-[#2c2420]"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="landing-mobile-menu"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="relative flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-[5px] rounded-xl border border-[#d4ccc0] bg-white shadow-sm sm:hidden"
        >
          <span
            className={`block h-[2px] w-[18px] rounded-full bg-[#2c2420] transition-transform duration-200 ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-[18px] rounded-full bg-[#2c2420] transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-[18px] rounded-full bg-[#2c2420] transition-transform duration-200 ${
              menuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="fixed inset-0 top-[57px] z-40 bg-[#1a1612]/20 sm:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="landing-mobile-menu"
            aria-label="모바일 페이지 메뉴"
            className="relative z-50 border-t border-[#e8e0d4] bg-[#faf8f5] px-5 py-3 shadow-lg sm:hidden"
          >
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className="w-full rounded-xl px-4 py-3.5 text-left text-sm font-medium text-[#2c2420] transition hover:bg-[#f5f0e8]"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}
