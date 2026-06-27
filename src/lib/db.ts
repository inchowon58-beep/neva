import { put, list } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import type { Database, GeneratedContent, KeywordEntry, KeywordInput, KeywordBulkDefaults, MainPageInput, MainPageLink } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "keywords.json");
const BLOB_FILENAME = "keywords.json";

const DEFAULT_DB: Database = { keywords: [], mainPages: [] };

function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readFromFile(): Promise<Database> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Database;
  } catch {
    return { ...DEFAULT_DB };
  }
}

async function writeToFile(db: Database): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

async function readFromBlob(): Promise<Database> {
  const { blobs } = await list({ prefix: BLOB_FILENAME, limit: 1 });
  const blob = blobs.find((b) => b.pathname === BLOB_FILENAME);

  if (!blob) {
    return { ...DEFAULT_DB };
  }

  const res = await fetch(blob.url);
  if (!res.ok) {
    return { ...DEFAULT_DB };
  }

  return (await res.json()) as Database;
}

async function writeToBlob(db: Database): Promise<void> {
  await put(BLOB_FILENAME, JSON.stringify(db, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function normalizeEntry(entry: KeywordEntry & { companyName?: string; pagePrompt?: string }): KeywordEntry {
  return {
    ...entry,
    companyName: entry.companyName ?? "",
    pagePrompt: entry.pagePrompt ?? "",
    indexNowSubmittedAt: entry.indexNowSubmittedAt ?? null,
  };
}

async function readDb(): Promise<Database> {
  let db: Database;
  if (isBlobStorageEnabled()) {
    db = await readFromBlob();
  } else {
    db = await readFromFile();
  }
  return {
    keywords: (db.keywords ?? []).map((k) =>
      normalizeEntry(k as KeywordEntry & { companyName?: string; pagePrompt?: string })
    ),
    mainPages: db.mainPages ?? [],
  };
}

async function writeDb(db: Database): Promise<void> {
  if (isBlobStorageEnabled()) {
    await writeToBlob(db);
    return;
  }
  await writeToFile(db);
}

export function slugify(keyword: string): string {
  return keyword
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\uAC00-\uD7A3-]/g, "");
}

/** 슬러그 끝의 넘버링 접미사(01~99) 제거 후 베이스 슬러그 반환 */
export function getBaseSlug(keyword: string): string {
  const trimmed = keyword.trim();
  const withoutSuffix = trimmed.replace(/\d{2}$/, "");
  return slugify(withoutSuffix);
}

/**
 * 동일 키워드/슬러그가 이미 있으면 01, 02… 접미사를 붙여 고유 슬러그·키워드 생성.
 * 기존 페이지는 절대 덮어쓰지 않음.
 */
export function resolveUniqueSlug(
  keyword: string,
  existingSlugs: string[]
): { slug: string; keyword: string } {
  const trimmed = keyword.trim();
  const baseSlug = getBaseSlug(trimmed);
  const slugSet = new Set(existingSlugs);

  const exactSlug = slugify(trimmed);
  if (!slugSet.has(exactSlug)) {
    return { slug: exactSlug, keyword: trimmed };
  }

  if (!slugSet.has(baseSlug)) {
    return { slug: baseSlug, keyword: trimmed };
  }

  const baseKeyword = trimmed.replace(/\d{2}$/, "");

  for (let i = 1; i <= 99; i++) {
    const suffix = String(i).padStart(2, "0");
    const candidateSlug = `${baseSlug}${suffix}`;
    if (!slugSet.has(candidateSlug)) {
      return {
        slug: candidateSlug,
        keyword: `${baseKeyword}${suffix}`,
      };
    }
  }

  throw new Error("슬러그 생성 한도(99)를 초과했습니다.");
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getAllKeywords(): Promise<KeywordEntry[]> {
  const db = await readDb();
  return db.keywords.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getKeywordBySlug(slug: string): Promise<KeywordEntry | null> {
  const db = await readDb();
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    decoded = slug;
  }

  return (
    db.keywords.find(
      (k) =>
        k.slug === slug ||
        k.slug === decoded ||
        k.slug.toLowerCase() === decoded.toLowerCase()
    ) ?? null
  );
}

export async function getKeywordById(id: string): Promise<KeywordEntry | null> {
  const db = await readDb();
  return db.keywords.find((k) => k.id === id) ?? null;
}

export async function createKeyword(input: KeywordInput): Promise<KeywordEntry> {
  const db = await readDb();
  const now = new Date().toISOString();
  const existingSlugs = db.keywords.map((k) => k.slug);
  const { slug, keyword } = resolveUniqueSlug(input.keyword, existingSlugs);

  const entry: KeywordEntry = {
    id: createId(),
    slug,
    keyword,
    companyName: input.companyName.trim(),
    imageUrl: input.imageUrl.trim(),
    homepageUrl: input.homepageUrl.trim(),
    phone: input.phone.trim(),
    pagePrompt: input.pagePrompt.trim(),
    generatedContent: null,
    contentGeneratedAt: null,
    indexNowSubmittedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  db.keywords.push(entry);
  await writeDb(db);
  return entry;
}

export interface BulkCreateResult {
  created: KeywordEntry[];
  skippedEmpty: number;
}

/** txt 등 — 여러 키워드 한 번에 DB 저장 (단일 write) */
export async function createKeywordsBulk(
  keywordLines: string[],
  defaults: KeywordBulkDefaults
): Promise<BulkCreateResult> {
  const db = await readDb();
  const now = new Date().toISOString();
  const existingSlugs = db.keywords.map((k) => k.slug);
  const created: KeywordEntry[] = [];
  let skippedEmpty = 0;

  for (const raw of keywordLines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      skippedEmpty++;
      continue;
    }

    const { slug, keyword } = resolveUniqueSlug(trimmed, existingSlugs);
    existingSlugs.push(slug);

    const entry: KeywordEntry = {
      id: createId(),
      slug,
      keyword,
      companyName: defaults.companyName.trim(),
      imageUrl: defaults.imageUrl.trim(),
      homepageUrl: defaults.homepageUrl.trim(),
      phone: defaults.phone.trim(),
      pagePrompt: defaults.pagePrompt.trim(),
      generatedContent: null,
      contentGeneratedAt: null,
      indexNowSubmittedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    db.keywords.push(entry);
    created.push(entry);
  }

  if (created.length > 0) {
    await writeDb(db);
  }

  return { created, skippedEmpty };
}

export async function updateKeyword(
  id: string,
  input: Partial<KeywordInput>
): Promise<KeywordEntry> {
  const db = await readDb();
  const index = db.keywords.findIndex((k) => k.id === id);

  if (index === -1) {
    throw new Error("키워드를 찾을 수 없습니다.");
  }

  const current = db.keywords[index];
  const keywordInput = input.keyword?.trim() ?? current.keyword;
  const existingSlugs = db.keywords.filter((k) => k.id !== id).map((k) => k.slug);

  let keyword = keywordInput;
  let newSlug = current.slug;

  if (keywordInput !== current.keyword) {
    const resolved = resolveUniqueSlug(keywordInput, existingSlugs);
    keyword = resolved.keyword;
    newSlug = resolved.slug;
  } else if (db.keywords.some((k) => k.slug === current.slug && k.id !== id)) {
    const resolved = resolveUniqueSlug(keywordInput, existingSlugs);
    keyword = resolved.keyword;
    newSlug = resolved.slug;
  }

  const updated: KeywordEntry = {
    ...current,
    keyword,
    slug: newSlug,
    companyName: input.companyName?.trim() ?? current.companyName,
    imageUrl: input.imageUrl?.trim() ?? current.imageUrl,
    homepageUrl: input.homepageUrl?.trim() ?? current.homepageUrl,
    phone: input.phone?.trim() ?? current.phone,
    pagePrompt: input.pagePrompt?.trim() ?? current.pagePrompt,
    updatedAt: new Date().toISOString(),
  };

  db.keywords[index] = updated;
  await writeDb(db);
  return updated;
}

export async function deleteKeyword(id: string): Promise<void> {
  const db = await readDb();
  const index = db.keywords.findIndex((k) => k.id === id);

  if (index === -1) {
    throw new Error("키워드를 찾을 수 없습니다.");
  }

  db.keywords.splice(index, 1);
  await writeDb(db);
}

export async function saveGeneratedContent(
  id: string,
  content: GeneratedContent
): Promise<KeywordEntry> {
  const db = await readDb();
  const index = db.keywords.findIndex((k) => k.id === id);

  if (index === -1) {
    throw new Error("키워드를 찾을 수 없습니다.");
  }

  const updated: KeywordEntry = {
    ...db.keywords[index],
    generatedContent: content,
    contentGeneratedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.keywords[index] = updated;
  await writeDb(db);
  return updated;
}

export async function getAllSlugs(): Promise<string[]> {
  const db = await readDb();
  return db.keywords.map((k) => k.slug);
}

export async function getAllKeywordsRaw(): Promise<KeywordEntry[]> {
  const db = await readDb();
  return db.keywords;
}

export async function markIndexNowSubmitted(id: string): Promise<void> {
  const db = await readDb();
  const index = db.keywords.findIndex((k) => k.id === id);
  if (index === -1) return;

  db.keywords[index] = {
    ...db.keywords[index],
    indexNowSubmittedAt: new Date().toISOString(),
  };
  await writeDb(db);
}

export async function seedDefaultKeywords(): Promise<void> {
  const db = await readDb();
  if (db.keywords.length > 0) return;

  const now = new Date().toISOString();
  const defaults: KeywordEntry[] = [
    {
      id: createId(),
      slug: slugify("네바마스커레이드분양"),
      keyword: "네바마스커레이드분양",
      companyName: "네바 마스커레이드",
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
      homepageUrl: "",
      phone: "",
      pagePrompt: "",
      generatedContent: null,
      contentGeneratedAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId(),
      slug: slugify("인천네바마스커레이드분양"),
      keyword: "인천네바마스커레이드분양",
      companyName: "인천 네바 마스커레이드",
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
      homepageUrl: "",
      phone: "",
      pagePrompt: "",
      generatedContent: null,
      contentGeneratedAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ];

  db.keywords.push(...defaults);
  await writeDb(db);
}

export async function getAllMainPages(): Promise<MainPageLink[]> {
  const db = await readDb();
  return db.mainPages.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createMainPage(input: MainPageInput): Promise<MainPageLink> {
  const db = await readDb();
  const now = new Date().toISOString();

  const entry: MainPageLink = {
    id: createId(),
    keyword: input.keyword.trim(),
    path: input.path.trim(),
    createdAt: now,
    updatedAt: now,
  };

  db.mainPages.push(entry);
  await writeDb(db);
  return entry;
}

export async function updateMainPage(
  id: string,
  input: Partial<MainPageInput>
): Promise<MainPageLink> {
  const db = await readDb();
  const index = db.mainPages.findIndex((p) => p.id === id);

  if (index === -1) {
    throw new Error("메인 페이지를 찾을 수 없습니다.");
  }

  const updated: MainPageLink = {
    ...db.mainPages[index],
    keyword: input.keyword?.trim() ?? db.mainPages[index].keyword,
    path: input.path?.trim() ?? db.mainPages[index].path,
    updatedAt: new Date().toISOString(),
  };

  db.mainPages[index] = updated;
  await writeDb(db);
  return updated;
}

export async function deleteMainPage(id: string): Promise<void> {
  const db = await readDb();
  const index = db.mainPages.findIndex((p) => p.id === id);

  if (index === -1) {
    throw new Error("메인 페이지를 찾을 수 없습니다.");
  }

  db.mainPages.splice(index, 1);
  await writeDb(db);
}
