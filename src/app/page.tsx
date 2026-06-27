import MainPageSwitcher from "@/components/MainPageSwitcher";
import LandingPageList from "@/components/LandingPageList";
import MainHeroSection from "@/components/MainHeroSection";
import MainStatsBanner from "@/components/MainStatsBanner";
import ServiceHighlightsSection from "@/components/ServiceHighlightsSection";
import ServicePricingSection from "@/components/ServicePricingSection";
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
      <MainHeroSection />
      <MainStatsBanner yesterdayPublishCount={yesterdayPublishCount} />
      <ServiceHighlightsSection />

      <section id="landing-list" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-16">
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <MainPageSwitcher mainPages={mainPages} currentPath="/" />
        </div>

        <div className="mb-8">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Live Demo
          </p>
          <h2 className="text-2xl font-bold text-slate-900">추가된 랜딩페이지 정보</h2>
          <p className="mt-2 text-sm text-slate-600">
            실제 발행된 네이버 노출 사례와 샘플 페이지를 확인해 보세요.
          </p>
        </div>
        <LandingPageList showcases={naverShowcases} />
      </section>

      <ServicePricingSection />
    </main>
  );
}
