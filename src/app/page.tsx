import MainPageSwitcher from "@/components/MainPageSwitcher";
import LandingPageList from "@/components/LandingPageList";
import MainStatsBanner from "@/components/MainStatsBanner";
import { MAIN_TITLE } from "@/lib/constants";
import { getYesterdayPublishCount } from "@/lib/main-stats";
import { getAllMainPages, getNaverShowcasesForMain } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSeedData();
  const mainPages = await getAllMainPages();
  const naverShowcases = await getNaverShowcasesForMain();
  const yesterdayPublishCount = getYesterdayPublishCount();

  return (
    <main>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center lg:py-24">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-blue-300">
            Google, Naver Landing Service
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {MAIN_TITLE}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base font-medium text-blue-200 sm:text-lg">
            키워드와 이미지 조합으로 끝내는 네이버 웹문서 대량 노출
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
            네바마스커레이드 키워드 관련 랜딩페이지 제공 서비스입니다.
            <br className="hidden sm:block" />
            네바마스커레이드 마케팅의 완벽한 치트키. 키워드, 이미지, 기본 정보만 입력하면
            검색엔진(SEO) 최적화 맞춤형 서브 랜딩페이지가 실시간으로 자동 생성됩니다.
          </p>
        </div>
      </section>

      <MainStatsBanner yesterdayPublishCount={yesterdayPublishCount} />

      <section id="landing-list" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-16">
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <MainPageSwitcher mainPages={mainPages} currentPath="/" />
        </div>

        <h2 className="mb-8 text-2xl font-bold text-slate-900">추가된 랜딩페이지 정보</h2>
        <LandingPageList showcases={naverShowcases} />
      </section>
    </main>
  );
}
