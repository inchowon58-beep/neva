const HIGHLIGHTS = [
  {
    icon: "🛡️",
    title: "블로그 저품질 걱정 없는 독립형 웹문서",
    description:
      "네이버 블로그는 로직 변경 시 지수가 통째로 날아갈 수 있습니다. 독립 웹문서는 누락 위험이 낮고, 축적될수록 사이트 힘이 강해집니다.",
    accent: "from-blue-500/10 to-blue-600/5 border-blue-200/60",
  },
  {
    icon: "✨",
    title: "AI 독창적 문서 (Unique Content)",
    description:
      "복붙 매크로가 아닙니다. 전문화된 전문 정보 풀에서 매번 랜덤 4개를 골라 H2 구조로 발행 — 검색엔진이 선호하는 고품질 문서.",
    accent: "from-violet-500/10 to-violet-600/5 border-violet-200/60",
  },
  {
    icon: "🎯",
    title: "유사 문서·저품질 필터 우회",
    description:
      "저가형 자동화는 텍스트가 똑같아 금방 누락됩니다. 데이터 풀 랜덤 조합 + 상단 키워드 동적 배치로 매번 다른 독창적 문서를 생성합니다.",
    accent: "from-emerald-500/10 to-emerald-600/5 border-emerald-200/60",
  },
  {
    icon: "🔔",
    title: "앱 실시간 알림",
    description:
      "페이지 새 발행·상담 신청 시 사장님 휴대폰 앱으로 띵동! 실시간 보고가 포함되어 월 구독료가 전혀 아깝지 않게 느껴집니다.",
    accent: "from-amber-500/10 to-amber-600/5 border-amber-200/60",
  },
] as const;

export default function ServiceHighlightsSection() {
  return (
    <section id="highlights" className="scroll-mt-6 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Why Choose Us
          </p>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            🚀 매출을 2배로 올리는 차별화 포인트
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            월 5~10만 원짜리 조잡한 블로그 매크로와는 차원이 다른 기술력입니다.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {HIGHLIGHTS.map((item) => (
            <article
              key={item.title}
              className={`rounded-2xl border bg-gradient-to-br p-6 shadow-sm transition hover:shadow-md ${item.accent}`}
            >
              <span className="text-3xl" aria-hidden>
                {item.icon}
              </span>
              <h3 className="mt-3 text-base font-bold leading-snug text-slate-900 sm:text-lg">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
