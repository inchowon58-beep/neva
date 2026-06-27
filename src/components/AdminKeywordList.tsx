"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ADMIN_BULK_AI_BATCH_SIZE,
  ADMIN_KEYWORD_LIST_MAX,
  ADMIN_KEYWORD_PAGE_SIZE,
  formatDate,
} from "@/lib/constants";
import type { KeywordEntry } from "@/types";

export type KeywordListItem = Omit<KeywordEntry, "generatedContent"> & {
  hasContent?: boolean;
};

function hasAiContent(entry: KeywordListItem): boolean {
  return Boolean(entry.hasContent || entry.contentGeneratedAt);
}

interface IndexNowResponse {
  ok?: boolean;
  skipped?: boolean;
  error?: string;
  message?: string;
}

function indexNowSuffix(indexNow?: IndexNowResponse | null): string {
  if (!indexNow) return "";
  if (indexNow.skipped && indexNow.message) return ` · ${indexNow.message}`;
  if (indexNow.skipped) return "";
  if (indexNow.ok) return " · IndexNow 알림";
  return ` · IndexNow 실패`;
}

interface AdminKeywordListProps {
  keywords: KeywordListItem[];
  totalCount: number;
  onRefresh: () => void;
  onEdit: (entry: KeywordListItem) => void;
  onMessage: (text: string, ms?: number) => void;
}

export default function AdminKeywordList({
  keywords,
  totalCount,
  onRefresh,
  onEdit,
  onMessage,
}: AdminKeywordListProps) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [bulkWorking, setBulkWorking] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, sortOrder, onlyMissing]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...keywords];

    if (q) {
      list = list.filter(
        (k) =>
          k.keyword.toLowerCase().includes(q) ||
          k.slug.toLowerCase().includes(q) ||
          k.companyName.toLowerCase().includes(q)
      );
    }

    if (onlyMissing) {
      list = list.filter((k) => !hasAiContent(k));
    }

    list.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? tb - ta : ta - tb;
    });

    return list;
  }, [keywords, search, sortOrder, onlyMissing]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_KEYWORD_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * ADMIN_KEYWORD_PAGE_SIZE;
    return filtered.slice(start, start + ADMIN_KEYWORD_PAGE_SIZE);
  }, [filtered, safePage]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectPage = () => {
    const pageIds = paginated.map((k) => k.id);
    const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPage) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const runGenerate = async (id: string): Promise<boolean> => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok;
  };

  const handleGenerateOne = async (id: string) => {
    setGeneratingId(id);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        onMessage(
          ((data.message as string) || "AI 콘텐츠 생성 완료") + indexNowSuffix(data.indexNow),
          6000
        );
        onRefresh();
      } else {
        onMessage((data.error as string) || "콘텐츠 생성 실패", 8000);
      }
    } catch {
      onMessage("콘텐츠 생성 요청 실패", 8000);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleBulkGenerate = async () => {
    const ids = [...selected].filter((id) => {
      const entry = keywords.find((k) => k.id === id);
      return entry && !hasAiContent(entry);
    });

    if (ids.length === 0) {
      onMessage("AI 생성할 미생성 키워드를 선택해 주세요.");
      return;
    }

    if (!confirm(`선택 ${ids.length}개 키워드 AI 콘텐츠를 생성합니다.\n(${ADMIN_BULK_AI_BATCH_SIZE}개씩 순차 처리)`)) {
      return;
    }

    setBulkWorking(true);
    let ok = 0;
    let fail = 0;

    for (let i = 0; i < ids.length; i += ADMIN_BULK_AI_BATCH_SIZE) {
      const batch = ids.slice(i, i + ADMIN_BULK_AI_BATCH_SIZE);
      for (const id of batch) {
        setGeneratingId(id);
        const success = await runGenerate(id);
        if (success) ok++;
        else fail++;
      }
      onMessage(`AI 생성 진행 중… ${Math.min(i + batch.length, ids.length)} / ${ids.length}`, 3000);
    }

    setGeneratingId(null);
    setBulkWorking(false);
    setSelected(new Set());
    onRefresh();
    onMessage(`일괄 AI 생성 완료 · 성공 ${ok}개${fail > 0 ? ` · 실패 ${fail}개` : ""}`, 8000);
  };

  const handleBulkDelete = async () => {
    const ids = [...selected];
    if (ids.length === 0) {
      onMessage("목록에서 제거할 키워드를 선택해 주세요.");
      return;
    }
    if (
      !confirm(
        `선택한 ${ids.length}개를 관리자 목록에서 제거합니다.\n\n랜딩 페이지는 그대로 유지됩니다.`
      )
    ) {
      return;
    }

    setBulkWorking(true);
    try {
      const res = await fetch("/api/keywords/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSelected(new Set());
        onRefresh();
        onMessage(
          `${data.hiddenCount ?? ids.length}개가 목록에서 제거되었습니다. (페이지는 유지)`
        );
      } else {
        onMessage((data.error as string) || "목록 제거 실패");
      }
    } catch {
      onMessage("목록 제거 요청 실패");
    } finally {
      setBulkWorking(false);
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (
      !confirm(
        "관리자 목록에서 제거합니다.\n\n랜딩 페이지는 그대로 유지됩니다."
      )
    ) {
      return;
    }
    const res = await fetch(`/api/keywords?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      onMessage("목록에서 제거되었습니다. (페이지는 유지)");
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      onRefresh();
    }
  };

  const pageAllSelected =
    paginated.length > 0 && paginated.every((k) => selected.has(k.id));

  return (
    <div id="keyword-list" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold">등록된 키워드</h2>
        <p className="mt-1 text-sm text-slate-500">
          최대 {ADMIN_KEYWORD_LIST_MAX}개 표시 · 전체 {totalCount}개 · 페이지당{" "}
          {ADMIN_KEYWORD_PAGE_SIZE}개
        </p>

        <form
          className="mt-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end"
          onSubmit={(e: FormEvent) => e.preventDefault()}
        >
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">키워드 검색</label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="키워드, 슬러그, 업체명"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">등록일 정렬</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="desc">내림차순 (최신 먼저)</option>
              <option value="asc">오름차순 (오래된 것 먼저)</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(e) => setOnlyMissing(e.target.checked)}
              className="rounded border-slate-300"
            />
            AI 콘텐츠 미생성만
          </label>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={bulkWorking || selected.size === 0}
            onClick={handleBulkGenerate}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40"
          >
            {bulkWorking ? "처리 중…" : `선택 일괄 AI 생성 (${selected.size})`}
          </button>
          <button
            type="button"
            disabled={bulkWorking || selected.size === 0}
            onClick={handleBulkDelete}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-40"
          >
            선택 목록 제거 ({selected.size})
          </button>
          <span className="self-center text-xs text-slate-500">
            목록 제거 시 랜딩 페이지는 유지 · AI 일괄 생성은 {ADMIN_BULK_AI_BATCH_SIZE}개씩 순차 처리
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-6 py-12 text-center text-slate-500">
          {keywords.length === 0 ? "등록된 키워드가 없습니다." : "검색·필터 조건에 맞는 키워드가 없습니다."}
        </p>
      ) : (
        <>
          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-6 py-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={pageAllSelected}
                onChange={toggleSelectPage}
                className="rounded border-slate-300"
              />
              현재 페이지 전체 선택
            </label>
            <span className="text-xs text-slate-500">
              {filtered.length}개 중 {(safePage - 1) * ADMIN_KEYWORD_PAGE_SIZE + 1}–
              {Math.min(safePage * ADMIN_KEYWORD_PAGE_SIZE, filtered.length)}번째
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {paginated.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(entry.id)}
                    onChange={() => toggleSelect(entry.id)}
                    className="mt-1 rounded border-slate-300"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{entry.keyword}</p>
                    <p className="text-sm text-blue-600">/landing/{entry.slug}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-500">
                      <span>{formatDate(entry.createdAt)}</span>
                      {entry.companyName && <span>{entry.companyName}</span>}
                      {entry.phone && <span>📞 {entry.phone}</span>}
                      {hasAiContent(entry) ? (
                        <span className="text-green-600">✓ AI 콘텐츠 생성됨</span>
                      ) : (
                        <span className="text-amber-600">⚠ 콘텐츠 미생성</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pl-7 lg:pl-0">
                  <a
                    href={`/landing/${encodeURIComponent(entry.slug)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    미리보기
                  </a>
                  <button
                    type="button"
                    onClick={() => handleGenerateOne(entry.id)}
                    disabled={bulkWorking || generatingId === entry.id}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {generatingId === entry.id ? "생성 중..." : "AI 콘텐츠 생성"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(entry)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOne(entry.id)}
                    disabled={bulkWorking}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-40"
                  >
                    목록 제거
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 px-6 py-4"
              aria-label="키워드 페이지"
            >
              {pageNumbers.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPage(p);
                    document.getElementById("keyword-list")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`min-h-9 min-w-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    safePage === p
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
