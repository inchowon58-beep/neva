"use client";

import type { KeywordEntry } from "@/types";
import {
  buildStructuredStoryBridge,
  type StructuredStoryBridge,
} from "@/lib/story-bridge";

interface StoryBridgeSectionProps {
  entry: KeywordEntry;
}

export default function StoryBridgeSection({ entry }: StoryBridgeSectionProps) {
  const data: StructuredStoryBridge = buildStructuredStoryBridge(entry);

  return (
    <section id="section-cattery" className="scroll-mt-20 full-bleed relative overflow-hidden bg-[#1a1612] py-16 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #c4a574 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, #c4a574 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#c4a574]/8 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#8b7355]/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-8 bg-[#c4a574]/60" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#c4a574]">
                {data.eyebrow}
              </p>
            </div>

            <h2 className="mt-6 font-serif text-3xl leading-snug text-[#f5f0e8] sm:text-4xl">
              {data.headline}
              <br />
              <span className="text-[#c4a574]">{data.headlineAccent}</span>
            </h2>

            <p className="mt-6 text-sm leading-relaxed text-[#a89888] sm:text-[15px] sm:leading-[1.8]">
              {data.lead}
            </p>

            <p className="mt-5 text-xs leading-relaxed text-[#6b5d4d] sm:text-sm">
              {data.closing}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {entry.homepageUrl && (
                <a
                  href={entry.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-2xl border border-[#c4a574]/35 px-6 py-3.5 text-sm text-[#c4a574] transition hover:bg-[#c4a574]/10"
                >
                  캐터리 더 알아보기
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4">
              {data.features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-[#c4a574]/15 bg-[#2c2420]/80 p-6 backdrop-blur-sm transition hover:border-[#c4a574]/30 sm:p-7"
                >
                  <div className="absolute -right-4 -top-4 text-6xl font-bold text-[#c4a574]/5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="relative flex gap-4 sm:gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c4a574]/15 text-xl">
                      {feature.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-lg text-[#f5f0e8] sm:text-xl">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#a89888]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#3d3429] pt-6">
              {["Premium Breed", "Health Checked", "Safe Delivery"].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-[#c4a574]/25 bg-[#c4a574]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#c4a574]"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
