function CheckIcon({ className = "text-emerald-500" }: { className?: string }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

const PLANS = [
  {
    id: "standard",
    badge: "Standard",
    badgeClass: "bg-slate-100 text-slate-700",
    headerClass: "from-slate-700 to-slate-900",
    title: "소상공인 · 단일 샵",
    price: "30",
    priceUnit: "만원 / 월",
    credits: "월 30개",
    creditLabel: "발행",
    description:
      "부천·수원 등 특정 지역 몇 군데만 꽉 잡고 싶은 동네 분양샵·소규모 업체에 적합합니다. 하루 1~2개꼴 꾸준 발행으로 지역 키워드를 점유합니다.",
    features: [
      "관리자 페이지 셀프 발행",
      "AI 독창적 콘텐츠 자동 생성",
      "IndexNow · 사이트맵 연동",
      "앱 실시간 알림",
    ],
    recommended: false,
  },
  {
    id: "premium",
    badge: "Premium · 추천",
    badgeClass: "bg-amber-400/20 text-amber-100",
    headerClass: "from-blue-600 to-indigo-800",
    title: "전문 대행사 · 다점포",
    price: "60",
    priceUnit: "만원 / 월",
    credits: "월 150개",
    creditLabel: "발행",
    description:
      "여러 품종·전국 단위 키워드를 다 잡아먹으려는 마케팅 대행사·대형 펫숍 타겟. 대량 업로드 기능 개방으로 API·서버 비용을 방어하며 고수익 구조.",
    features: [
      "Standard 전 기능 포함",
      "1+1 일괄 등록 · 대량 발행",
      "월 150개 발행",
      "우선 기술 지원",
    ],
    recommended: true,
  },
  {
    id: "enterprise",
    badge: "Enterprise",
    badgeClass: "bg-purple-400/20 text-purple-100",
    headerClass: "from-purple-800 to-slate-900",
    title: "성공 보장형 독점 대행",
    price: "150",
    priceUnit: "만원 / 월",
    credits: "월 300개",
    creditLabel: "발행",
    description:
      "매달 핵심 지역 키워드 300개 도배·노출까지 풀 관리. 클라이언트는 관리자 페이지를 건드릴 필요 없이 전담팀이 밀착 케어합니다.",
    features: [
      "Premium 전 기능 포함",
      "키워드 선정 · 발행 전담",
      "월 300개 자동 도배",
      "노출 성과 리포트",
    ],
    recommended: false,
  },
] as const;

export default function ServicePricingSection() {
  return (
    <section id="pricing" className="scroll-mt-6 border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            Subscription Plans
          </p>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            💎 SaaS 요금제 — 발행 크레딧 기준
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            등록 횟수(발행 크레딧)를 기준으로 월 정기 결제하는 구독 모델입니다.
            <br className="hidden sm:block" />
            비즈니스 규모에 맞는 플랜을 선택하세요.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-xl ${
                plan.recommended
                  ? "border-2 border-blue-400 ring-4 ring-blue-100 lg:scale-[1.02]"
                  : "border border-slate-200"
              }`}
            >
              {plan.recommended && (
                <div className="absolute -right-8 top-6 rotate-45 bg-amber-400 px-10 py-1 text-xs font-bold text-slate-900 shadow">
                  BEST
                </div>
              )}

              <div className={`bg-gradient-to-r px-6 py-5 text-white ${plan.headerClass}`}>
                <span
                  className={`mb-2 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${plan.badgeClass}`}
                >
                  {plan.badge}
                </span>
                <h3 className="text-lg font-bold">{plan.title}</h3>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4">
                  <p className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-sm text-slate-500">{plan.priceUnit}</span>
                  </p>
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-semibold text-blue-600">{plan.credits}</span>
                    <span className="text-slate-600"> {plan.creditLabel}</span>
                  </p>
                </div>

                <p className="mb-5 text-sm leading-relaxed text-slate-600">{plan.description}</p>

                <ul className="mt-auto space-y-2.5 border-t border-slate-100 pt-5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckIcon className={plan.recommended ? "text-blue-500" : "text-emerald-500"} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Add-on Option
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">개별 사이트 커스텀</h3>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                개별 사이트 제작 후 개별 도메인으로 웹문서 노출 페이지를 생성합니다.
                Enterprise와 병행하거나 독립 운영 가능합니다.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-4 lg:gap-6">
              <div className="text-center">
                <p className="text-xs text-slate-500">초기 비용</p>
                <p className="text-xl font-bold text-slate-900">
                  79<span className="text-sm font-normal text-slate-500">만원</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">월 관리비용</p>
                <p className="text-xl font-bold text-slate-900">
                  30<span className="text-sm font-normal text-slate-500">만원</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">월 발행</p>
                <p className="text-xl font-bold text-blue-600">
                  100<span className="text-sm font-normal text-slate-500">개 크레딧</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">※ VAT 별도</p>
      </div>
    </section>
  );
}
