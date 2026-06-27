/** 반려묘 사진 — 얼굴·눈이 프레임에 오도록 크롭 기준 */

export type ImageFocusLayout = "hero" | "banner" | "portrait" | "split" | "gallery";

/** object-position: 가로 중앙 + 세로는 위쪽(얼굴) 쪽 */
export const FACE_OBJECT_POSITION: Record<ImageFocusLayout, string> = {
  hero: "center 28%",
  banner: "center 18%",
  portrait: "center 22%",
  split: "center 26%",
  gallery: "center 24%",
};

export function getFaceObjectPosition(layout: ImageFocusLayout = "split"): string {
  return FACE_OBJECT_POSITION[layout];
}

/** Unsplash 등 — imgix focalpoint로 상단(얼굴) 가중 */
export function optimizeImageSrcForFace(src: string): string {
  if (!src?.trim()) return src;

  try {
    if (src.includes("images.unsplash.com")) {
      const base = src.split("?")[0];
      return `${base}?auto=format&fit=crop&w=1200&q=85&crop=focalpoint&fp-y=0.22&fp-z=1.15`;
    }
  } catch {
    return src;
  }

  return src;
}

/** 얼굴 클로즈업 위주 Unsplash 폴백 */
export const FACE_FORWARD_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1574158622682-e40e69881006",
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
  "https://images.unsplash.com/photo-1495360010541-f48722b34f7d",
  "https://images.unsplash.com/photo-1529778873920-4da4926a72c2",
  "https://images.unsplash.com/photo-1571566882372-1598d88abd58",
  "https://images.unsplash.com/photo-1595433707802-6b2626ef1ca1",
  "https://images.unsplash.com/photo-1533738363252-7b64b1285a00",
  "https://images.unsplash.com/photo-1514889588516-4a7bf0a05096",
  "https://images.unsplash.com/photo-1548247417-553816a247d0",
  "https://images.unsplash.com/photo-1592194996308-7b43878e84a6",
  "https://images.unsplash.com/photo-1511048937914-ecaf965c263b",
  "https://images.unsplash.com/photo-1573865526739-10b8ddd8771d",
  "https://images.unsplash.com/photo-1513245543132-31f507299bca",
  "https://images.unsplash.com/photo-1541783245831-566aa4a4ad44",
  "https://images.unsplash.com/photo-1526336024174-e58f5cdd171e",
].map(optimizeImageSrcForFace);

export function buildFaceFocusedClassName(
  layout: ImageFocusLayout,
  extra = ""
): string {
  const pos = getFaceObjectPosition(layout).replace(" ", "_");
  return `object-cover object-[${pos}] ${extra}`.trim();
}
