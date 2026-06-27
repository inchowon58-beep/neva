import type { LandingImage } from "@/types";
import {
  FACE_FORWARD_FALLBACK_IMAGES,
  optimizeImageSrcForFace,
} from "@/lib/image-focus";

const CATTERY_IMAGE_HOST = "image.cattery.co.kr";
const CATTERY_DEFAULT_MAX = 59;

const FALLBACK_PET_IMAGES = FACE_FORWARD_FALLBACK_IMAGES;

export { FALLBACK_PET_IMAGES };

const ALT_CONTEXTS = [
  "품종 소개",
  "외형 특징",
  "성격과 기질",
  "털 관리",
  "실내 생활",
  "건강한 모습",
  "보호자와 교감",
  "자연스러운 포즈",
  "품종별 특성",
  "반려동물 정보",
  "프리미엄 캐터리",
  "입양 상담",
  "품종 가이드",
  "반려묘 라이프",
  "네바마스커레이드",
];

export interface LandingImageAssignment {
  hero: LandingImage | null;
  sections: LandingImage[];
  gallery: LandingImage[];
  spareSrcs: string[];
}

interface CatteryManifest {
  count?: number;
  images?: { path: string }[];
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  let s = hashString(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeFolderBase(folderUrl: string): string {
  return folderUrl.trim().replace(/\/$/, "");
}

export function isFolderImageUrl(url: string): boolean {
  if (!url?.trim()) return false;

  try {
    const parsed = new URL(url.trim());
    const lastSegment = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
    return !/\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(lastSegment);
  } catch {
    return false;
  }
}

export function isCatteryFolderUrl(url: string): boolean {
  if (!url?.trim()) return false;
  try {
    return new URL(url.trim()).hostname === CATTERY_IMAGE_HOST && isFolderImageUrl(url);
  } catch {
    return false;
  }
}

function getCatteryFolderKey(folderUrl: string): string {
  const parsed = new URL(folderUrl.trim());
  const segments = parsed.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "maincoon";
}

/** image.cattery.co.kr — 01.webp, 02.webp … 형식 */
function buildCatteryFolderImageUrl(base: string, index: number): string {
  const padded = String(index).padStart(2, "0");
  return `${base}/${padded}.webp`;
}

function buildCatteryFolderSrcPool(
  folderUrl: string,
  seed: string,
  count: number,
  maxIndex = CATTERY_DEFAULT_MAX
): string[] {
  const base = normalizeFolderBase(folderUrl);
  const indices = seededShuffle(
    Array.from({ length: maxIndex }, (_, i) => i + 1),
    `${seed}-cattery-idx`
  );

  return indices.slice(0, count).map((index) => buildCatteryFolderImageUrl(base, index));
}

async function fetchCatteryManifestUrls(folderUrl: string): Promise<string[] | null> {
  try {
    const parsed = new URL(folderUrl.trim());
    const folderKey = getCatteryFolderKey(folderUrl);
    const manifestUrl = `${parsed.origin}/data/${folderKey}-images.json`;
    const res = await fetch(manifestUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = (await res.json()) as CatteryManifest;
    if (!data.images?.length) return null;

    return data.images.map((img) => {
      const path = img.path.startsWith("/") ? img.path : `/${img.path}`;
      return `${parsed.origin}${path}`;
    });
  } catch {
    return null;
  }
}

/** 일반 폴더 — jpg 우선 (확장자 랜덤 추측 제거) */
function buildGenericFolderSrcPool(folderUrl: string, seed: string, count: number): string[] {
  const base = normalizeFolderBase(folderUrl);
  const maxIndex = 60;
  const indices = seededShuffle(
    Array.from({ length: maxIndex }, (_, i) => i + 1),
    `${seed}-folder-idx`
  );

  return indices.slice(0, count).map((index) => `${base}/${index}.jpg`);
}

async function buildFolderSrcPool(
  folderUrl: string,
  seed: string,
  count: number
): Promise<string[]> {
  if (isCatteryFolderUrl(folderUrl)) {
    const manifestUrls = await fetchCatteryManifestUrls(folderUrl);
    if (manifestUrls?.length) {
      const shuffled = seededShuffle(manifestUrls, `${seed}-manifest`);
      if (shuffled.length >= count) {
        return shuffled.slice(0, count);
      }
      const padded = buildCatteryFolderSrcPool(
        folderUrl,
        seed,
        count - shuffled.length,
        manifestUrls.length
      ).filter((url) => !shuffled.includes(url));
      return [...shuffled, ...padded].slice(0, count);
    }
    return buildCatteryFolderSrcPool(folderUrl, seed, count);
  }

  return buildGenericFolderSrcPool(folderUrl, seed, count);
}

function appendFallbackUrls(urls: string[], seed: string, count: number): string[] {
  const fallbacks = seededShuffle(FALLBACK_PET_IMAGES, `${seed}-fb`).filter(
    (src) => !urls.includes(src)
  );
  return [...new Set([...urls, ...fallbacks])].slice(0, count);
}

async function buildUniqueSrcPool(
  imageUrl: string,
  seed: string,
  count: number
): Promise<string[]> {
  const needed = Math.max(count, 5);

  if (imageUrl?.trim()) {
    if (isFolderImageUrl(imageUrl)) {
      const folderPool = await buildFolderSrcPool(imageUrl, seed, needed);
      if (folderPool.length >= needed) return folderPool;
      return appendFallbackUrls(folderPool, seed, needed);
    }

    const single = imageUrl.trim();
    const rest = seededShuffle(FALLBACK_PET_IMAGES, `${seed}-fb`).filter((s) => s !== single);
    return [single, ...rest].slice(0, needed);
  }

  return seededShuffle(FALLBACK_PET_IMAGES, `${seed}-fb`).slice(0, needed);
}

export function buildImageAlt(keyword: string, context: string, index: number): string {
  return `${keyword} ${context} - 반려동물 품종 정보 사진 ${index + 1}`;
}

function toLandingImages(
  srcs: string[],
  keyword: string,
  seed: string,
  startAlt = 0
): LandingImage[] {
  const altOrder = seededShuffle(ALT_CONTEXTS, `${seed}-alts`);
  return srcs.map((src, i) => ({
    src: optimizeImageSrcForFace(src),
    alt: buildImageAlt(keyword, altOrder[(startAlt + i) % altOrder.length], startAlt + i),
  }));
}

export async function assignLandingImages(
  imageUrl: string,
  keyword: string,
  seed: string,
  sectionCount: number,
  galleryCount = 8
): Promise<LandingImageAssignment> {
  const total = 1 + sectionCount + galleryCount + 5;
  const pool = await buildUniqueSrcPool(imageUrl, seed, total);
  const shuffled = seededShuffle(pool, `${seed}-assign`);

  const heroSrc = shuffled[0] ?? null;
  const sectionSrcs = shuffled.slice(1, 1 + sectionCount);
  const gallerySrcs = shuffled.slice(1 + sectionCount, 1 + sectionCount + galleryCount);
  const spareSrcs = shuffled.slice(1 + sectionCount + galleryCount);

  return {
    hero: heroSrc ? toLandingImages([heroSrc], keyword, seed, 0)[0] : null,
    sections: toLandingImages(sectionSrcs, keyword, `${seed}-sec`, 1),
    gallery: toLandingImages(gallerySrcs, keyword, `${seed}-gal`, 1 + sectionCount),
    spareSrcs: [...spareSrcs, ...FALLBACK_PET_IMAGES.filter((s) => !shuffled.includes(s))],
  };
}

export async function pickLandingImages(
  imageUrl: string,
  keyword: string,
  seed: string,
  min = 5,
  max = 10
): Promise<LandingImage[]> {
  const count = min + (hashString(`${seed}-count`) % (max - min + 1));
  const assignment = await assignLandingImages(imageUrl, keyword, seed, 4, count);
  return [
    ...(assignment.hero ? [assignment.hero] : []),
    ...assignment.sections,
    ...assignment.gallery,
  ].slice(0, count);
}

export async function getRandomImageFromFolder(folderUrl: string, seed: string): Promise<string> {
  const pool = await buildFolderSrcPool(folderUrl, seed, 1);
  return pool[0] ?? "";
}

export async function resolveImageUrl(imageUrl: string, seed: string): Promise<string> {
  if (!imageUrl?.trim()) return "";
  const pool = await buildUniqueSrcPool(imageUrl, seed, 1);
  return pool[0] ?? imageUrl.trim();
}

export function getImageCandidatesSync(imageUrl: string, seed: string): string[] {
  const needed = 12;
  if (imageUrl?.trim() && isFolderImageUrl(imageUrl)) {
    if (isCatteryFolderUrl(imageUrl)) {
      return appendFallbackUrls(buildCatteryFolderSrcPool(imageUrl, seed, needed), seed, needed);
    }
    return appendFallbackUrls(buildGenericFolderSrcPool(imageUrl, seed, needed), seed, needed);
  }
  return seededShuffle(FALLBACK_PET_IMAGES, `${seed}-fb`).slice(0, needed);
}

export async function getImageCandidates(imageUrl: string, seed: string): Promise<string[]> {
  const assignment = await assignLandingImages(imageUrl, "", seed, 4, 6);
  return assignment.spareSrcs;
}

/** ContentImage용 — 현재 src 제외한 폴백 후보 */
export function buildImageFallbackChain(
  primarySrc: string,
  spareSrcs: string[],
  seed: string
): string[] {
  const ordered = [
    ...spareSrcs,
    ...seededShuffle(FALLBACK_PET_IMAGES, `${seed}-chain`),
  ];
  return [...new Set(ordered.filter((src) => src && src !== primarySrc))];
}
