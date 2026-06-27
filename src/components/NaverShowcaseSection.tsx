import { formatDate } from "@/lib/constants";
import { formatNaverRank, resolveNaverSearchUrl } from "@/lib/naver-search";
import type { NaverShowcase } from "@/types";

function NaverLogoMark() {
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-white text-[11px] font-black leading-none text-[#03C75A]"
      aria-hidden
    >
      N
    </span>
  );
}

interface NaverShowcaseSectionProps {
  showcases: NaverShowcase[];
}

export default function NaverShowcaseSection({ showcases }: NaverShowcaseSectionProps) {
  if (showcases.length === 0) return null;

  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-[#f0faf4] to-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 text-center">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#03C75A]/10 px-4 py-1 text-sm font-semibold text-[#03C75A]">
            <NaverLogoMark />
            NAVER 노출 사례
          </p>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            실제 네이버 검색 노출 성과
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            등록된 키워드의 네이버 웹문서 노출 순위를 직접 확인해 보세요.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {showcases.map((item) => {
            const searchUrl = resolveNaverSearchUrl(item.keyword, item.naverSearchUrl);

            return (
              <article
                key={item.id}
                className="flex flex-col rounded-2xl border border-[#03C75A]/20 bg-white p-5 shadow-sm transition hover:border-[#03C75A]/40 hover:shadow-md"
              >
                <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#03C75A] px-3 py-1 text-xs font-bold text-white">
                  <NaverLogoMark />
                  네이버 노출순위 {formatNaverRank(item.rank)}
                </div>

                <h3 className="text-base font-bold leading-snug text-slate-900">{item.keyword}</h3>

                <div className="mt-2 space-y-0.5 text-xs text-slate-500">
                  {item.companyName && <p>{item.companyName}</p>}
                  <p>{formatDate(item.displayDate)}</p>
                </div>

                <a
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#03C75A] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#02b351]"
                >
                  <NaverLogoMark />
                  네이버 순위 확인
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
