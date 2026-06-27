import { get, list, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import {
  isServerlessDeploy,
  shouldUseBlobStorage,
  StorageNotConfiguredError,
} from "@/lib/storage";
import { MAIN_NAVER_SHOWCASE_REGISTER_MAX, DEFAULT_MAIN_SHOWCASE_DISPLAY_COUNT, MAX_MAIN_SHOWCASE_DISPLAY_COUNT } from "@/lib/constants";
import type { Database, GeneratedContent, KeywordEntry, KeywordInput, KeywordBulkDefaults, MainPageInput, MainPageLink, NaverShowcase, NaverShowcaseInput, SiteSettings } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "keywords.json");
const BLOB_FILENAME = "keywords.json";

const DEFAULT_DB: Database = {
  keywords: [],
  mainPages: [],
  naverShowcases: [],
  settings: { mainShowcaseDisplayCount: DEFAULT_MAIN_SHOWCASE_DISPLAY_COUNT },
};

function normalizeDb(db: Database): Database {
  return {
    keywords: (db.keywords ?? []).map((k) =>
      normalizeEntry(k as KeywordEntry & { companyName?: string; pagePrompt?: string })
    ),
    mainPages: db.mainPages ?? [],
    naverShowcases: (db.naverShowcases ?? []).map(normalizeNaverShowcase),
    settings: normalizeSettings(db.settings),
  };
}

function normalizeSettings(settings?: SiteSettings): SiteSettings {
  const count = settings?.mainShowcaseDisplayCount ?? DEFAULT_MAIN_SHOWCASE_DISPLAY_COUNT;
  return {
    mainShowcaseDisplayCount: Math.min(
      MAX_MAIN_SHOWCASE_DISPLAY_COUNT,
      Math.max(1, Math.floor(count) || DEFAULT_MAIN_SHOWCASE_DISPLAY_COUNT)
    ),
  };
}

function normalizeNaverShowcase(entry: NaverShowcase): NaverShowcase {
  return {
    ...entry,
    companyName: entry.companyName ?? "",
    rank: entry.rank ?? 1,
    naverSearchUrl: entry.naverSearchUrl ?? "",
  };
}

async function readFromFile(): Promise<Database> {
  if (isServerlessDeploy()) {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf-8");
      return JSON.parse(raw) as Database;
    } catch {
      return { ...DEFAULT_DB };
    }
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Database;
  } catch {
    return { ...DEFAULT_DB };
  }
}

async function writeToFile(db: Database): Promise<void> {
  if (isServerlessDeploy()) {
    throw new StorageNotConfiguredError();
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

async function blobKeywordsFileExists(): Promise<boolean> {
  const { blobs } = await list({ prefix: BLOB_FILENAME, limit: 10 });
  return blobs.some((b) => b.pathname === BLOB_FILENAME);
}

async function readBlobJson(): Promise<Database | null> {
  const result = await get(BLOB_FILENAME, { access: "private" });
  if (!result?.stream) {
    return null;
  }
  const text = await new Response(result.stream as ReadableStream).text();
  if (!text.trim()) return null;
  return JSON.parse(text) as Database;
}

/** null = Blob에 keywords.json 없음. throw = 파일은 있는데 읽기 실패 */
async function readFromBlob(): Promise<Database | null> {
  const exists = await blobKeywordsFileExists();
  if (!exists) {
    return null;
  }

  try {
    const fromGet = await readBlobJson();
    if (fromGet) return fromGet;
  } catch {
    // get() 실패 — 아래 재시도
  }

  const { blobs } = await list({ prefix: BLOB_FILENAME, limit: 10 });
  const blob = blobs.find((b) => b.pathname === BLOB_FILENAME);

  if (!blob) {
    return null;
  }

  try {
    const res = await fetch(blob.url);
    if (res.ok) {
      return (await res.json()) as Database;
    }
  } catch {
    // private blob
  }

  try {
    const fromGet = await readBlobJson();
    if (fromGet) return fromGet;
  } catch {
    // ignore
  }

  throw new Error(
    "Blob keywords.json 읽기에 실패했습니다. 잠시 후 다시 시도해 주세요."
  );
}

async function writeToBlob(db: Database): Promise<void> {
  await put(BLOB_FILENAME, JSON.stringify(db, null, 2), {
    access: "private",
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
    generatedContent: entry.generatedContent ?? null,
    contentGeneratedAt: entry.contentGeneratedAt ?? null,
    indexNowSubmittedAt: entry.indexNowSubmittedAt ?? null,
    hiddenFromAdminAt: entry.hiddenFromAdminAt ?? null,
  };
}

function isAdminVisible(entry: KeywordEntry): boolean {
  return !entry.hiddenFromAdminAt;
}

async function readDb(): Promise<Database> {
  if (shouldUseBlobStorage()) {
    const blobDb = await readFromBlob();

    if (blobDb !== null) {
      return normalizeDb(blobDb);
    }

    // Blob에 keywords.json 없을 때만 번들 파일 1회 이전 (읽기 실패 시 덮어쓰지 않음)
    if (isServerlessDeploy()) {
      const fileDb = await readFromFile();
      const hasFileData =
        (fileDb.keywords?.length ?? 0) > 0 || (fileDb.mainPages?.length ?? 0) > 0;
      if (hasFileData) {
        await writeToBlob(fileDb);
        return normalizeDb(fileDb);
      }
    }

    return normalizeDb({ ...DEFAULT_DB });
  }

  return normalizeDb(await readFromFile());
}

async function writeDb(db: Database): Promise<void> {
  if (shouldUseBlobStorage()) {
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

/** 관리자 목록용 — 숨김 처리된 키워드 제외 */
export async function getAdminKeywords(): Promise<KeywordEntry[]> {
  const db = await readDb();
  return db.keywords
    .filter(isAdminVisible)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

/** 관리자 목록에서만 숨김 — 랜딩 페이지는 유지 */
export async function hideKeywordFromAdmin(id: string): Promise<void> {
  const db = await readDb();
  const index = db.keywords.findIndex((k) => k.id === id);

  if (index === -1) {
    throw new Error("키워드를 찾을 수 없습니다.");
  }

  if (db.keywords[index].hiddenFromAdminAt) {
    return;
  }

  db.keywords[index] = {
    ...db.keywords[index],
    hiddenFromAdminAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await writeDb(db);
}

export async function hideKeywordsFromAdminBulk(ids: string[]): Promise<number> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return 0;

  const db = await readDb();
  const idSet = new Set(unique);
  const now = new Date().toISOString();
  let hidden = 0;

  db.keywords = db.keywords.map((k) => {
    if (!idSet.has(k.id) || k.hiddenFromAdminAt) {
      return k;
    }
    hidden++;
    return {
      ...k,
      hiddenFromAdminAt: now,
      updatedAt: now,
    };
  });

  if (hidden > 0) {
    await writeDb(db);
  }
  return hidden;
}

/** DB에서 완전 삭제 — 랜딩 페이지 404 */
export async function deleteKeywordPermanent(id: string): Promise<KeywordEntry> {
  const db = await readDb();
  const index = db.keywords.findIndex((k) => k.id === id);

  if (index === -1) {
    throw new Error("키워드를 찾을 수 없습니다.");
  }

  const [removed] = db.keywords.splice(index, 1);
  await writeDb(db);
  return removed;
}

export async function deleteKeywordBySlug(slug: string): Promise<KeywordEntry> {
  const entry = await getKeywordBySlug(slug);
  if (!entry) {
    throw new Error("해당 슬러그의 키워드를 찾을 수 없습니다.");
  }
  return deleteKeywordPermanent(entry.id);
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
  if (isServerlessDeploy() && !shouldUseBlobStorage()) {
    return;
  }

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

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = await readDb();
  return db.settings ?? normalizeSettings();
}

export async function updateMainShowcaseDisplayCount(count: number): Promise<SiteSettings> {
  const db = await readDb();
  const normalized = Math.min(
    MAX_MAIN_SHOWCASE_DISPLAY_COUNT,
    Math.max(1, Math.floor(count) || DEFAULT_MAIN_SHOWCASE_DISPLAY_COUNT)
  );
  db.settings = { mainShowcaseDisplayCount: normalized };
  await writeDb(db);
  return db.settings;
}

export async function getAllNaverShowcases(): Promise<NaverShowcase[]> {
  const db = await readDb();
  return db.naverShowcases.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getNaverShowcasesForMain(): Promise<NaverShowcase[]> {
  const settings = await getSiteSettings();
  const all = await getAllNaverShowcases();
  return all.slice(0, settings.mainShowcaseDisplayCount);
}

export async function createNaverShowcase(input: NaverShowcaseInput): Promise<NaverShowcase> {
  const db = await readDb();

  if (db.naverShowcases.length >= MAIN_NAVER_SHOWCASE_REGISTER_MAX) {
    throw new Error(
      `노출 사례는 최대 ${MAIN_NAVER_SHOWCASE_REGISTER_MAX}개까지 등록할 수 있습니다.`
    );
  }

  if (!input.keyword?.trim()) {
    throw new Error("키워드는 필수입니다.");
  }
  if (!input.companyName?.trim()) {
    throw new Error("업체명은 필수입니다.");
  }
  if (!input.displayDate?.trim()) {
    throw new Error("등록일은 필수입니다.");
  }

  const now = new Date().toISOString();
  const entry: NaverShowcase = {
    id: createId(),
    keyword: input.keyword.trim(),
    companyName: input.companyName.trim(),
    displayDate: input.displayDate.trim(),
    rank: Math.max(1, Math.floor(input.rank ?? 1) || 1),
    naverSearchUrl: input.naverSearchUrl?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
  };

  db.naverShowcases.push(entry);
  await writeDb(db);
  return entry;
}

export async function updateNaverShowcase(
  id: string,
  input: Partial<NaverShowcaseInput>
): Promise<NaverShowcase> {
  const db = await readDb();
  const index = db.naverShowcases.findIndex((s) => s.id === id);

  if (index === -1) {
    throw new Error("노출 사례를 찾을 수 없습니다.");
  }

  const current = db.naverShowcases[index];
  const updated: NaverShowcase = {
    ...current,
    keyword: input.keyword?.trim() ?? current.keyword,
    companyName: input.companyName?.trim() ?? current.companyName,
    displayDate: input.displayDate?.trim() ?? current.displayDate,
    rank:
      input.rank !== undefined
        ? Math.max(1, Math.floor(input.rank) || 1)
        : current.rank,
    naverSearchUrl:
      input.naverSearchUrl !== undefined
        ? input.naverSearchUrl.trim()
        : current.naverSearchUrl,
    updatedAt: new Date().toISOString(),
  };

  db.naverShowcases[index] = updated;
  await writeDb(db);
  return updated;
}

export async function deleteNaverShowcase(id: string): Promise<void> {
  const db = await readDb();
  const index = db.naverShowcases.findIndex((s) => s.id === id);

  if (index === -1) {
    throw new Error("노출 사례를 찾을 수 없습니다.");
  }

  db.naverShowcases.splice(index, 1);
  await writeDb(db);
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
