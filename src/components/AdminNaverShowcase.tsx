"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  DEFAULT_MAIN_SHOWCASE_DISPLAY_COUNT,
  MAIN_NAVER_SHOWCASE_REGISTER_MAX,
  MAX_MAIN_SHOWCASE_DISPLAY_COUNT,
  formatDate,
} from "@/lib/constants";
import { buildNaverSearchUrl } from "@/lib/naver-search";
import type { NaverShowcase } from "@/types";

const emptyForm = {
  keyword: "",
  companyName: "",
  displayDate: "",
  rank: "1",
  naverSearchUrl: "",
};

interface AdminNaverShowcaseProps {
  onMessage: (text: string, ms?: number) => void;
}

export default function AdminNaverShowcase({ onMessage }: AdminNaverShowcaseProps) {
  const [showcases, setShowcases] = useState<NaverShowcase[]>([]);
  const [displayCount, setDisplayCount] = useState(DEFAULT_MAIN_SHOWCASE_DISPLAY_COUNT);
  const [displayCountInput, setDisplayCountInput] = useState(
    String(DEFAULT_MAIN_SHOWCASE_DISPLAY_COUNT)
  );
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingDisplayCount, setSavingDisplayCount] = useState(false);

  const fetchShowcases = async () => {
    const res = await fetch("/api/naver-showcases");
    if (res.ok) {
      const data = await res.json();
      setShowcases(data.showcases ?? []);
      const count =
        data.settings?.mainShowcaseDisplayCount ?? DEFAULT_MAIN_SHOWCASE_DISPLAY_COUNT;
      setDisplayCount(count);
      setDisplayCountInput(String(count));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShowcases();
  }, []);

  const handleDisplayCountSave = async (e: FormEvent) => {
    e.preventDefault();
    setSavingDisplayCount(true);
    try {
      const res = await fetch("/api/naver-showcases/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayCount: Number(displayCountInput) }),
      });
      const data = await res.json();
      if (res.ok) {
        const count = data.settings.mainShowcaseDisplayCount;
        setDisplayCount(count);
        setDisplayCountInput(String(count));
        onMessage(`메인 노출 개수가 ${count}개로 설정되었습니다.`);
      } else {
        onMessage(data.error || "설정 저장 실패");
      }
    } finally {
      setSavingDisplayCount(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const url = "/api/naver-showcases";
    const method = editingId ? "PUT" : "POST";
    const body = {
      ...(editingId ? { id: editingId } : {}),
      keyword: form.keyword,
      companyName: form.companyName,
      displayDate: form.displayDate,
      rank: Number(form.rank) || 1,
      naverSearchUrl: form.naverSearchUrl,
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok) {
      onMessage(editingId ? "노출 사례가 수정되었습니다." : "노출 사례가 등록되었습니다.");
      setForm(emptyForm);
      setEditingId(null);
      fetchShowcases();
    } else {
      onMessage(data.error || "저장 실패");
    }
  };

  const handleEdit = (item: NaverShowcase) => {
    setEditingId(item.id);
    setForm({
      keyword: item.keyword,
      companyName: item.companyName,
      displayDate: item.displayDate.slice(0, 10),
      rank: String(item.rank),
      naverSearchUrl: item.naverSearchUrl,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 노출 사례를 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/naver-showcases?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      onMessage("삭제되었습니다.");
      fetchShowcases();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const previewUrl = form.keyword.trim()
    ? form.naverSearchUrl.trim() || buildNaverSearchUrl(form.keyword)
    : "";

  const visibleOnMain = Math.min(displayCount, showcases.length);

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleDisplayCountSave}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-1 text-lg font-semibold">메인 노출 개수 설정</h2>
        <p className="mb-4 text-sm text-slate-600">
          「추가된 랜딩페이지 정보」에 표시할 노출 사례 개수입니다. 샘플 페이지 미리보기는
          항상 맨 앞에 고정됩니다.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-40">
            <label className="mb-1 block text-sm font-medium text-slate-700">노출 개수</label>
            <input
              type="number"
              min={1}
              max={MAX_MAIN_SHOWCASE_DISPLAY_COUNT}
              required
              value={displayCountInput}
              onChange={(e) => setDisplayCountInput(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-[#03C75A] focus:outline-none focus:ring-2 focus:ring-[#03C75A]/20"
            />
          </div>
          <button
            type="submit"
            disabled={savingDisplayCount}
            className="rounded-lg bg-slate-800 px-6 py-2.5 font-medium text-white hover:bg-slate-700 disabled:opacity-40"
          >
            {savingDisplayCount ? "저장 중…" : "노출 개수 저장"}
          </button>
          <p className="text-sm text-slate-500 sm:pb-2">
            현재 메인 표시: 샘플 1개 + 노출 사례 {visibleOnMain}개
          </p>
        </div>
      </form>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#03C75A]/30 bg-[#f0faf4]/50 p-6 shadow-sm"
      >
        <h2 className="mb-1 text-lg font-semibold text-[#027a3d]">
          {editingId ? "메인 노출 사례 수정" : "메인 노출 사례 등록"}
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          키워드·업체명·등록일을 설정하고, 「네이버 순위 확인」 버튼으로 검색 결과 페이지로
          이동합니다. 등록은 최대 {MAIN_NAVER_SHOWCASE_REGISTER_MAX}개, 메인 노출은 위 설정
          개수만큼 표시됩니다.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              키워드 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.keyword}
              onChange={(e) => setForm({ ...form, keyword: e.target.value })}
              placeholder="예: 부천네바마스커레이드분양"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-[#03C75A] focus:outline-none focus:ring-2 focus:ring-[#03C75A]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              업체명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="예: 캐터리"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-[#03C75A] focus:outline-none focus:ring-2 focus:ring-[#03C75A]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              등록일 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.displayDate}
              onChange={(e) => setForm({ ...form, displayDate: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-[#03C75A] focus:outline-none focus:ring-2 focus:ring-[#03C75A]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">네이버 노출 순위</label>
            <input
              type="number"
              min={1}
              max={99}
              value={form.rank}
              onChange={(e) => setForm({ ...form, rank: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-[#03C75A] focus:outline-none focus:ring-2 focus:ring-[#03C75A]/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              네이버 검색 URL <span className="text-slate-400">(선택)</span>
            </label>
            <input
              type="url"
              value={form.naverSearchUrl}
              onChange={(e) => setForm({ ...form, naverSearchUrl: e.target.value })}
              placeholder="비우면 키워드로 자동 생성"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-[#03C75A] focus:outline-none focus:ring-2 focus:ring-[#03C75A]/20"
            />
            {previewUrl && (
              <p className="mt-1 text-xs text-slate-500">
                미리보기:{" "}
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#03C75A] underline-offset-2 hover:underline"
                >
                  {previewUrl}
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={!editingId && showcases.length >= MAIN_NAVER_SHOWCASE_REGISTER_MAX}
            className="rounded-lg bg-[#03C75A] px-6 py-2.5 font-medium text-white hover:bg-[#02b351] disabled:opacity-40"
          >
            {editingId ? "수정하기" : "등록하기"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-slate-600 hover:bg-slate-50"
            >
              취소
            </button>
          )}
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">
            등록된 노출 사례 ({showcases.length}/{MAIN_NAVER_SHOWCASE_REGISTER_MAX}) · 메인
            노출 {visibleOnMain}/{displayCount}
          </h2>
        </div>
        {loading ? (
          <p className="px-6 py-12 text-center text-slate-500">불러오는 중…</p>
        ) : showcases.length === 0 ? (
          <p className="px-6 py-12 text-center text-slate-500">등록된 노출 사례가 없습니다.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {showcases.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{item.keyword}</p>
                    {index < displayCount && (
                      <span className="rounded-full bg-[#03C75A]/10 px-2 py-0.5 text-xs font-medium text-[#03C75A]">
                        메인 노출
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    {item.companyName} · {formatDate(item.displayDate)} · {item.rank}위
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={item.naverSearchUrl || buildNaverSearchUrl(item.keyword)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-[#03C75A] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#02b351]"
                  >
                    네이버 확인
                  </a>
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
