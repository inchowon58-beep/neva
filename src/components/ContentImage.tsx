"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  FACE_FORWARD_FALLBACK_IMAGES,
  getFaceObjectPosition,
  type ImageFocusLayout,
} from "@/lib/image-focus";

interface ContentImageProps {
  src: string;
  alt: string;
  fallbackSrcs?: string[];
  priority?: boolean;
  className?: string;
  focusLayout?: ImageFocusLayout | "none";
  faceZoom?: boolean;
}

export default function ContentImage({
  src,
  alt,
  fallbackSrcs = [],
  priority = false,
  className = "object-cover",
  focusLayout = "split",
  faceZoom = true,
}: ContentImageProps) {
  const candidates = useMemo(() => {
    const merged = [src, ...fallbackSrcs, ...FACE_FORWARD_FALLBACK_IMAGES];
    return [...new Set(merged.filter(Boolean))];
  }, [src, fallbackSrcs]);

  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFailed(false);
  }, [src]);

  const currentSrc = candidates[index] ?? "";

  const objectPosition =
    focusLayout === "none" ? undefined : getFaceObjectPosition(focusLayout);

  if (!currentSrc || failed) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-[#2c2420]/80"
        aria-label={alt}
      >
        <span className="px-4 text-center text-xs text-[#a89888]">이미지를 불러올 수 없습니다</span>
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      className={`${className}${faceZoom ? " scale-105" : ""}`}
      style={objectPosition ? { objectPosition } : undefined}
      priority={priority}
      sizes="(max-width: 1024px) 100vw, 800px"
      onError={() => {
        if (index < candidates.length - 1) {
          setIndex((prev) => prev + 1);
        } else {
          setFailed(true);
        }
      }}
      unoptimized
    />
  );
}
