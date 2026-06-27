import { buildNearbyAreasIntro, getNearbyAreas } from "@/lib/region";
import type { KeywordEntry } from "@/types";

interface NearbyAreasSectionProps {
  entry: KeywordEntry;
}

export default function NearbyAreasSection({ entry }: NearbyAreasSectionProps) {
  const { region, areas, fromMap } = getNearbyAreas(entry.keyword);

  if (areas.length === 0 || !region) return null;

  const intro = buildNearbyAreasIntro(entry.keyword, region, areas);

  return (
    <section id="section-nearby" className="scroll-mt-20 bg-white py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b7355]">
            Nearby Areas
          </p>
          <h2 className="mt-3 font-serif text-3xl text-[#2c2420] sm:text-4xl">
            {region} <em className="text-[#8b7355] not-italic">인근 지역 안내</em>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[#6b5d4d]">
            {entry.keyword.replace(/\d{2}$/, "")} 검색과 함께 찾으시는 {region} 주변{" "}
            {fromMap ? "행정동" : "생활권"} 정보입니다.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {areas.map((area, index) => (
            <li
              key={area}
              className="rounded-2xl border border-[#e8e0d4] bg-[#faf8f5] p-5 text-center shadow-sm"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c4a574]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 font-serif text-lg text-[#2c2420]">{area}</p>
              <p className="mt-2 text-xs leading-relaxed text-[#8b7355]">{region} 인근</p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-[1.9] text-[#5c4f42] sm:text-base">
          {intro}
        </p>
      </div>
    </section>
  );
}
