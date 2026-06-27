function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-emerald-500"
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

function PriceRow({
  label,
  amount,
  unit,
  highlight,
}: {
  label: string;
  amount: string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 border-b border-slate-100 py-3 last:border-0 ${
        highlight ? "rounded-lg bg-slate-50/80 px-3 -mx-3" : ""
      }`}
    >
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-right">
        <span className={`font-bold ${highlight ? "text-xl text-slate-900" : "text-lg text-slate-800"}`}>
          {amount}
        </span>
        <span className="ml-0.5 text-sm text-slate-500">{unit}</span>
      </span>
    </div>
  );
}

export default function ServicePricingSection() {
  return (
    <section className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            Service Plans
          </p>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">서비스 요금 안내</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            비즈니스 규모에 맞는 웹문서 노출 플랜을 선택하세요.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* 커스텀 개별사이트 */}
          <article className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 text-white">
              <span className="mb-2 inline-block rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-semibold text-amber-200">
                Premium
              </span>
              <h3 className="text-lg font-bold leading-snug sm:text-xl">
                개별사이트 커스텀
                <br />
                웹문서등록 서비스
              </h3>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                개별사이트 제작 후 개별 도메인을 통해 웹문서 노출 진행 페이지가 생성됩니다.
              </p>

              <div className="mb-6">
                <PriceRow label="초기 비용" amount="50" unit="만원" highlight />
                <PriceRow label="월 관리비용" amount="30" unit="만원" />
              </div>

              <ul className="mt-auto space-y-3 border-t border-slate-100 pt-5">
                <li className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckIcon />
                  <span>
                    <strong className="font-semibold text-slate-900">하루 발행</strong> 최대{" "}
                    <strong className="text-blue-600">300개</strong>까지
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckIcon />
                  <span>개별 도메인 연동 · 맞춤형 사이트 제작</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckIcon />
                  <span>네이버·구글 웹문서 노출 최적화</span>
                </li>
              </ul>
            </div>
          </article>

          {/* 랜딩페이지 발행 */}
          <article className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-blue-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-lg">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5 text-white">
              <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold text-blue-100">
                Standard
              </span>
              <h3 className="text-lg font-bold leading-snug sm:text-xl">
                웹문서 랜딩페이지
                <br />
                발행 서비스
              </h3>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                키워드와 이미지만 등록하면 SEO 최적화 랜딩페이지가 자동 생성되어 네이버
                웹문서에 노출됩니다.
              </p>

              <div className="mb-6">
                <PriceRow label="월 관리비용" amount="30" unit="만원" highlight />
              </div>

              <ul className="mt-auto space-y-3 border-t border-slate-100 pt-5">
                <li className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckIcon />
                  <span>
                    <strong className="font-semibold text-slate-900">하루 등록</strong> 가능 수량{" "}
                    <strong className="text-blue-600">100개</strong>까지
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckIcon />
                  <span>실시간 자동 페이지 생성 · IndexNow 연동</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckIcon />
                  <span>AI 콘텐츠 생성 · 키워드별 맞춤 SEO</span>
                </li>
              </ul>
            </div>
          </article>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          ※ 상기 요금은 VAT 별도이며, 상세 조건은 문의 시 안내해 드립니다.
        </p>
      </div>
    </section>
  );
}
