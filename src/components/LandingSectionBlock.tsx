import ContentImage from "@/components/ContentImage";
import type { ImageFocusLayout } from "@/lib/image-focus";
import type { ContentSection, LandingImage } from "@/types";
type LayoutVariant = "feature-split" | "banner-stack" | "editorial" | "inset-card";

const LAYOUTS: LayoutVariant[] = ["feature-split", "banner-stack", "editorial", "inset-card"];

function getLayout(index: number): LayoutVariant {
  return LAYOUTS[index % LAYOUTS.length];
}

export function isFullBleedSection(index: number): boolean {
  return getLayout(index) === "inset-card";
}

interface SectionImageProps {
  image: LandingImage;
  caption?: boolean;
  focusLayout?: ImageFocusLayout;
}

function SectionImage({
  image,
  caption = true,
  focusLayout = "split",
}: SectionImageProps) {
  return (
    <figure className="group relative h-full w-full overflow-hidden">
      <div className="relative h-full min-h-[inherit] w-full">
        <ContentImage
          src={image.src}
          alt={image.alt}
          fallbackSrcs={image.fallbackSrcs}
          focusLayout={focusLayout}
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />      </div>
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a1612]/90 to-transparent px-4 pb-3 pt-10 text-[10px] tracking-wide text-[#c4a574] opacity-0 transition duration-300 group-hover:opacity-100">
          {image.alt}
        </figcaption>
      )}
    </figure>
  );
}

function Subsections({
  subsections,
  variant = "stack",
  dark = false,
}: {
  subsections: ContentSection["subsections"];
  variant?: "stack" | "grid";
  dark?: boolean;
}) {
  if (!subsections?.length) return null;

  const cardClass = dark
    ? "rounded-xl border border-[#c4a574]/25 bg-[#1a1612]/60 p-5 sm:p-6"
    : "rounded-2xl border border-[#e8e0d4]/80 bg-[#faf8f5] p-5 sm:p-6";

  return (
    <div className="mt-8 grid w-full grid-cols-1 gap-4">
      {subsections.map((sub, i) => (
        <div key={i} className={`w-full ${cardClass}`}>
          <h3
            className={`flex items-center gap-3 text-sm font-semibold sm:text-base ${
              dark ? "text-[#c4a574]" : "text-[#3d3429]"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                dark
                  ? "bg-[#c4a574]/20 text-[#c4a574]"
                  : "bg-[#c4a574]/20 text-[#8b7355]"
              }`}
            >
              {i + 1}
            </span>
            {sub.heading}
          </h3>
          <p
            className={`mt-3 text-sm leading-relaxed sm:text-[15px] sm:leading-[1.75] ${
              dark ? "text-[#a89888]" : "text-[#6b5d4d]"
            }`}
          >
            {sub.content}
          </p>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({
  heading,
  index,
  isPrimary,
}: {
  heading: string;
  index: number;
  isPrimary?: boolean;
}) {
  return (
    <div className="mb-6">
      {isPrimary && (
        <span className="mb-3 inline-block rounded-full bg-[#c4a574]/15 px-3 py-1 text-xs font-medium text-[#8b7355]">
          검색 키워드 핵심 정보
        </span>
      )}
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8b7355]/70">
        Section {String(index + 1).padStart(2, "0")}
      </p>
      <h2 className="mt-2 font-serif text-2xl leading-snug text-[#2c2420] sm:text-3xl">
        {heading}
      </h2>
    </div>
  );
}

interface LandingSectionBlockProps {
  section: ContentSection;
  index: number;
  image?: LandingImage;
  isPrimary?: boolean;
}

function FeatureSplitLayout(props: LandingSectionBlockProps) {
  const { section, index, image, isPrimary } = props;
  return (
    <article className="overflow-hidden rounded-3xl border border-[#e8e0d4] bg-white shadow-sm">
      <div className="grid lg:grid-cols-12 lg:items-stretch">
        <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-7 lg:p-12">
          <SectionHeading heading={section.heading} index={index} isPrimary={isPrimary} />
          <p className="whitespace-pre-line text-base leading-[1.85] text-[#5c4f42]">
            {section.content}
          </p>
          <Subsections subsections={section.subsections} variant="grid" />
        </div>
        {image && (
          <div className="relative min-h-[280px] lg:col-span-5 lg:min-h-[320px]">
            <div className="absolute inset-0 m-4 mt-0 overflow-hidden rounded-2xl lg:m-6 lg:ml-0">
              <SectionImage image={image} focusLayout="split" />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function BannerStackLayout(props: LandingSectionBlockProps) {
  const { section, index, image } = props;
  return (
    <article className="overflow-hidden rounded-3xl border border-[#e8e0d4] bg-white shadow-sm">
      {image && (
        <div className="relative h-[220px] sm:h-[280px] md:h-[320px]">
          <SectionImage
            image={image}
            caption={false}
            focusLayout="banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1612]/75 via-[#1a1612]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 sm:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c4a574]">
              Section {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-2 max-w-xl font-serif text-2xl text-white sm:text-3xl">
              {section.heading}
            </h2>
          </div>
        </div>
      )}
      <div className="p-8 sm:p-10">
        {!image && <SectionHeading heading={section.heading} index={index} />}
        <p className="whitespace-pre-line text-base leading-[1.85] text-[#5c4f42]">
          {section.content}
        </p>
        <Subsections subsections={section.subsections} variant="grid" />
      </div>
    </article>
  );
}

function EditorialLayout(props: LandingSectionBlockProps) {
  const { section, index, image } = props;
  return (
    <article className="overflow-hidden rounded-3xl bg-[#f5f0e8]/50 p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(240px,34%)_1fr] lg:items-start lg:gap-12">
        {image && (
          <div className="lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-md sm:aspect-[3/4]">
              <SectionImage image={image} focusLayout="portrait" />
            </div>
            <p className="mt-3 text-center text-[10px] uppercase tracking-widest text-[#8b7355]">
              {image.alt}
            </p>
          </div>
        )}
        <div className="rounded-2xl border border-[#e8e0d4]/60 bg-white p-8 sm:p-10">
          <SectionHeading heading={section.heading} index={index} />
          <p className="whitespace-pre-line text-base leading-[1.85] text-[#5c4f42]">
            {section.content}
          </p>
          <Subsections subsections={section.subsections} variant="stack" />
        </div>
      </div>
    </article>
  );
}

function InsetCardLayout(props: LandingSectionBlockProps) {
  const { section, index, image } = props;
  return (
    <article className="full-bleed relative overflow-hidden bg-[#2c2420]">
      <div className="grid lg:grid-cols-2 lg:items-stretch">
        <div className="order-2 flex flex-col justify-center px-6 py-10 text-[#f5f0e8] sm:px-10 sm:py-14 lg:order-1 lg:px-16 lg:py-16 xl:px-24">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c4a574]">
            Section {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-3 font-serif text-2xl leading-snug sm:text-3xl lg:text-4xl">
            {section.heading}
          </h2>
          <p className="mt-6 whitespace-pre-line text-base leading-[1.85] text-[#d4ccc0] sm:text-[17px]">
            {section.content}
          </p>
          <Subsections subsections={section.subsections} dark />
        </div>
        {image && (
          <div className="relative order-1 min-h-[280px] lg:order-2 lg:min-h-[480px]">
            <SectionImage
              image={image}
              caption={false}
              focusLayout="portrait"
            />
          </div>
        )}
      </div>
    </article>
  );
}

export default function LandingSectionBlock(props: LandingSectionBlockProps) {
  switch (getLayout(props.index)) {
    case "feature-split":
      return <FeatureSplitLayout {...props} />;
    case "banner-stack":
      return <BannerStackLayout {...props} />;
    case "editorial":
      return <EditorialLayout {...props} />;
    case "inset-card":
      return <InsetCardLayout {...props} />;
  }
}

export function LandingGallery({ images }: { images: LandingImage[] }) {
  const bentoClass = (i: number) => {
    if (i === 0) return "col-span-2 row-span-2";
    if (i === 2) return "row-span-2";
    if (i === 5) return "col-span-2";
    return "";
  };

  return (
    <div className="grid auto-rows-[130px] grid-cols-2 gap-3 sm:auto-rows-[150px] md:grid-cols-4 md:gap-4">
      {images.map((img, i) => (
        <figure
          key={img.src}
          className={`group relative overflow-hidden rounded-2xl shadow-sm ${bentoClass(i)}`}
        >
          <ContentImage
            src={img.src}
            alt={img.alt}
            fallbackSrcs={img.fallbackSrcs}
            focusLayout="gallery"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 pt-8 text-xs text-[#d4ccc0] opacity-0 transition duration-300 group-hover:opacity-100">
            {img.alt}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
