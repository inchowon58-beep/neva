import Link from "next/link";
import { MAIN_TITLE } from "@/lib/constants";

export default function MainHeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(59,130,246,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16,185,129,0.25) 0%, transparent 40%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center lg:py-24">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-200">
          <span className="text-base">💎</span>
          월 구독 · 발행 크레딧 기반 SaaS
        </p>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{MAIN_TITLE}</h1>
        <p className="mx-auto mt-5 max-w-3xl text-base font-medium text-blue-200 sm:text-xl">
          키워드만 등록하면 독립형 웹문서가 자동 발행되고,
          <br className="hidden sm:block" />
          네이버·구글 검색 노출까지 한 번에.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          프로그램 일회 판매가 아닌 <strong className="text-white">월 정기 구독</strong> 모델.
          관리자 페이지에서 등록한 횟수만큼 <strong className="text-emerald-300">발행 크레딧</strong>
          이 차감되며, AI가 매번 다른 고품질 문서를 생성합니다.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#pricing"
            className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400"
          >
            요금제 보기
          </a>
          <a
            href="#highlights"
            className="rounded-xl border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
          >
            왜 우리 서비스인가
          </a>
          <Link
            href="/admin"
            className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
          >
            관리자 데모
          </Link>
        </div>
      </div>
    </section>
  );
}
