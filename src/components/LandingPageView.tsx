import ContentImage from "@/components/ContentImage";
import LandingBottomBar from "@/components/LandingBottomBar";
import LandingHeader from "@/components/LandingHeader";
import LandingSectionBlock, {
  LandingGallery,
  isFullBleedSection,
} from "@/components/LandingSectionBlock";
import StoryBridgeSection from "@/components/StoryBridgeSection";
import NearbyAreasSection from "@/components/NearbyAreasSection";
import { assignLandingImages, buildImageFallbackChain } from "@/lib/image";
import { buildHeroH1, extractRegionName } from "@/lib/region";
import type { GeneratedContent, KeywordEntry, LandingImage } from "@/types";

type LandingVariant = "default" | "sample";

interface LandingPageProps {
  entry: KeywordEntry;
  content: GeneratedContent;
  embedded?: boolean;
  variant?: LandingVariant;
}

export default async function LandingPageView({
  entry,
  content,
  embedded = false,
  variant = "default",
}: LandingPageProps) {
  const imageSeed = `${entry.slug}-${entry.updatedAt}`;
  const sectionCount = content.sections.length;
  const images = await assignLandingImages(
    entry.imageUrl,
    entry.keyword,
    imageSeed,
    sectionCount,
    8
  );
  const heroImage = images.hero;
  const spareSrcs = images.spareSrcs;

  const fallbackFor = (src: string) => buildImageFallbackChain(src, spareSrcs, imageSeed);

  const withFallbacks = (img: LandingImage): LandingImage => ({
    ...img,
    fallbackSrcs: fallbackFor(img.src),
  });

  const heroImageResolved = heroImage ? withFallbacks(heroImage) : null;
  const sectionImages = images.sections.map(withFallbacks);
  const galleryImages = images.gallery.map(withFallbacks);

  const companyName = entry.companyName || "Premium Cattery";
  const heroEyebrow = content.heroEyebrow;
  const heroTitle = content.heroTitle;
  const heroSubtitle = content.heroSubtitle;
  const heroH1 = buildHeroH1(entry.keyword, heroTitle);

  return (
    <article
      className={`landing-cattery ${embedded ? "" : "min-h-screen"} bg-[#faf8f5] pb-28`}
    >
      {/* Header */}
      <LandingHeader
        companyName={companyName}
        keyword={entry.keyword}
        showGallery={images.gallery.length > 0}
        showNearby={Boolean(extractRegionName(entry.keyword))}
      />

      {/* Hero */}
      <section
        id="section-hero"
        className="scroll-mt-20 relative mx-4 mt-4 overflow-hidden rounded-3xl bg-[#1a1612] text-[#f5f0e8] sm:mx-6 lg:mx-auto lg:max-w-6xl"
      >        <div className="relative min-h-[68vh]">
          {heroImageResolved && (
            <div className="absolute inset-0">
              <ContentImage
                src={heroImageResolved.src}
                alt={heroImageResolved.alt}
                fallbackSrcs={heroImageResolved.fallbackSrcs}
                priority
                focusLayout="hero"
                className="object-cover opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a1612]/85 via-[#1a1612]/55 to-[#1a1612]/95" />
            </div>
          )}

          <div className="relative flex min-h-[68vh] flex-col items-center justify-center px-6 py-20 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#c4a574]">
              {variant === "sample" ? "SAMPLE · PREMIUM HERO" : heroEyebrow}
            </p>
            <h1 className="max-w-4xl font-serif text-3xl leading-snug sm:text-4xl lg:text-5xl">
              <span className="mb-3 block text-2xl font-semibold tracking-tight text-[#c4a574] sm:text-3xl lg:text-4xl">
                {heroH1.keywordLine}
              </span>
              <span className="block text-[#f5f0e8]">{heroH1.titleLine}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#d4ccc0] sm:text-lg">
              {heroSubtitle}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {entry.phone && (
                <a
                  href={`tel:${entry.phone.replace(/[^0-9+]/g, "")}`}
                  className="rounded-2xl bg-[#c4a574] px-8 py-3.5 text-sm font-semibold tracking-wide text-[#1a1612] transition hover:bg-[#d4b584]"
                >
                  {entry.phone}
                </a>
              )}
              {entry.homepageUrl && (
                <a
                  href={entry.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-[#c4a574]/50 px-8 py-3.5 text-sm font-semibold tracking-wide text-[#c4a574] transition hover:bg-[#c4a574]/10"
                >
                  About Cattery
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section id="section-about" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-20 sm:px-6">        <div className="grid gap-10 overflow-hidden rounded-3xl border border-[#e8e0d4] bg-white p-8 shadow-sm sm:p-12 lg:grid-cols-5 lg:items-start lg:gap-14">
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b7355]">
              About Us
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-snug text-[#2c2420] sm:text-4xl">
              {entry.keyword}{" "}
              <em className="text-[#8b7355] not-italic">프리미엄 입양 정보</em>
            </h2>
            <div className="mt-6 h-px w-16 bg-[#c4a574]/50" />
          </div>
          <p className="whitespace-pre-line text-base leading-[1.9] text-[#5c4f42] lg:col-span-3">
            {content.intro}
          </p>
        </div>
      </section>

      {/* Breed Information */}
      <section id="section-breed" className="scroll-mt-20 bg-[#f5f0e8]/60 py-20">        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mb-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b7355]">
              Breed Information
            </p>
            <h2 className="mt-3 font-serif text-3xl text-[#2c2420] sm:text-4xl">
              {entry.keyword.replace(/분양|입양|\d{2}$/g, "")}{" "}
              <em className="text-[#8b7355] not-italic">Guide</em>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[#6b5d4d]">
              {content.metaDescription}
            </p>
          </div>
        </div>

        <div className="space-y-16 lg:space-y-20">
          {content.sections.map((section, index) => {
            const sectionImage = sectionImages[index];
            const block = (
              <LandingSectionBlock
                key={index}
                section={section}
                index={index}
                image={sectionImage}
                isPrimary={index === 0}
              />
            );

            if (isFullBleedSection(index)) {
              return block;
            }

            return (
              <div key={index} className="mx-auto max-w-6xl px-5 sm:px-6">
                {block}
              </div>
            );
          })}
        </div>
      </section>

      <StoryBridgeSection entry={entry} />

      {/* Gallery */}
      {images.gallery.length > 0 && (
        <section id="section-gallery" className="scroll-mt-20 bg-[#1a1612] py-20 text-[#f5f0e8]">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c4a574]">
                Gallery
              </p>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
                Our <em className="text-[#c4a574] not-italic">{entry.keyword}</em>
              </h2>
            </div>
            <LandingGallery images={galleryImages} />
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="section-contact" className="scroll-mt-20 border-t border-[#e8e0d4] bg-[#faf8f5] py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b7355]">
              Contact
            </p>
            <h2 className="mt-3 font-serif text-3xl text-[#2c2420]">연락처</h2>
            <p className="mt-4 leading-relaxed text-[#6b5d4d]">
              {entry.keyword}에 대한 자세한 정보는 아래 연락처 또는 공식 홈페이지를 이용해 주세요.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {entry.homepageUrl && (
                <a
                  href={entry.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl bg-[#2c2420] px-8 py-3.5 text-sm font-semibold text-[#f5f0e8] transition hover:bg-[#3d3429]"
                >
                  공식 홈페이지
                </a>
              )}
              {entry.phone && (
                <a
                  href={`tel:${entry.phone.replace(/[^0-9+]/g, "")}`}
                  className="rounded-2xl bg-[#c4a574] px-8 py-3.5 text-sm font-semibold text-[#1a1612] transition hover:bg-[#d4b584]"
                >
                  {entry.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <NearbyAreasSection entry={entry} />

      {/* Footer strip */}
      <footer className="border-t border-[#e8e0d4] bg-[#2c2420] py-10 text-center text-sm text-[#a89888]">
        <p className="font-serif text-[#c4a574]">{companyName}</p>
        <p className="mt-2 text-xs uppercase tracking-widest">
          © {new Date().getFullYear()} All Rights Reserved.
        </p>
      </footer>

      <LandingBottomBar
        homepageUrl={entry.homepageUrl}
        phone={entry.phone}
        keyword={entry.keyword}
      />
    </article>
  );
}
