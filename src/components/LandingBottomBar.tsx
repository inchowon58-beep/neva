"use client";

interface LandingBottomBarProps {
  homepageUrl?: string;
  phone?: string;
  keyword: string;
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export default function LandingBottomBar({ homepageUrl, phone, keyword }: LandingBottomBarProps) {
  if (!homepageUrl && !phone) return null;

  const telHref = phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : "";
  const shortKeyword = keyword.replace(/분양|입양|\d{2}$/g, "").slice(0, 12);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#3d3429]/80 bg-[#1a1612]/97 shadow-[0_-8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl divide-x divide-[#3d3429]">
        {homepageUrl && (
          <a
            href={homepageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-5 py-3.5 transition hover:bg-[#2a241e] sm:flex-row sm:items-center sm:gap-3 sm:px-8 sm:py-4"
          >
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b7355]">
              Official Site
            </span>
            <span className="truncate text-sm font-medium text-[#d4ccc0] sm:text-base">
              {stripProtocol(homepageUrl)}
            </span>
          </a>
        )}
        {phone && (
          <a
            href={telHref}
            className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-5 py-3.5 transition hover:bg-[#2a241e] sm:flex-row sm:items-baseline sm:gap-3 sm:px-8 sm:py-4"
          >
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c4a574]/75">
              {shortKeyword || "입양"} 문의
            </span>
            <span className="font-serif text-lg font-semibold tracking-wide text-[#c4a574] sm:text-xl">
              {phone}
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
