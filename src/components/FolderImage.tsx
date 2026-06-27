"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageCandidatesSync } from "@/lib/image";

interface FolderImageProps {
  imageUrl: string;
  seed: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export default function FolderImage({
  imageUrl,
  seed,
  alt,
  priority = false,
  className = "object-cover",
}: FolderImageProps) {
  const candidates = getImageCandidatesSync(imageUrl, seed);
  const [index, setIndex] = useState(0);
  const src = candidates[index] ?? "";

  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      priority={priority}
      sizes="(max-width: 1024px) 100vw, 50vw"
      onError={() => {
        if (index < candidates.length - 1) {
          setIndex((prev) => prev + 1);
        }
      }}
      unoptimized
    />
  );
}
