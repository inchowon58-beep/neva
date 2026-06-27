import { normalizeGeneratedContent } from "@/lib/gemini";
import { createVariationSeed } from "@/lib/hero-copy";
import { getKeywordBySlug, saveGeneratedContent } from "@/lib/db";
import { generateLandingContent, getDefaultContent } from "@/lib/gemini";
import type { GeneratedContent, KeywordEntry } from "@/types";

export function enrichContent(entry: KeywordEntry, content: GeneratedContent): GeneratedContent {
  return normalizeGeneratedContent(
    content,
    entry.keyword,
    createVariationSeed(entry),
    entry
  );
}

export async function getOrGenerateContent(
  entry: KeywordEntry
): Promise<{ entry: KeywordEntry; content: GeneratedContent }> {
  if (entry.generatedContent) {
    return { entry, content: enrichContent(entry, entry.generatedContent) };
  }

  try {
    const content = await generateLandingContent(entry);
    const updated = await saveGeneratedContent(entry.id, content);
    return { entry: updated, content };
  } catch {
    const content = getDefaultContent(entry);
    return { entry, content };
  }
}

export async function getLandingBySlug(slug: string) {
  const entry = await getKeywordBySlug(slug);
  if (!entry) return null;
  return getOrGenerateContent(entry);
}
