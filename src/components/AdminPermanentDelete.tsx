"use client";

import { FormEvent, useState } from "react";

interface AdminPermanentDeleteProps {
  onMessage: (text: string, ms?: number) => void;
}

export default function AdminPermanentDelete({ onMessage }: AdminPermanentDeleteProps) {
  const [pageUrl, setPageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmed = pageUrl.trim();
    if (!trimmed) {
      onMessage("삭제할 페이지 주소를 입력해 주세요.");
      return;
    }

    if (
      !confirm(
        `아래 페이지를 영구 삭제합니다.\n\n${trimmed}\n\n삭제 후에는 랜딩 페이지가 404로 표시되며 복구할 수 없습니다.\n\n계속하시겠습니까?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/keywords/permanent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setPageUrl("");
        onMessage(
          `「${data.keyword}」 페이지가 영구 삭제되었습니다. (/landing/${data.slug})`,
          8000
        );
      } else {
        onMessage((data.error as string) || "영구 삭제 실패", 8000);
      }
    } catch {
      onMessage("영구 삭제 요청 실패", 8000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/40 shadow-sm">
      <div className="border-b border-red-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-red-900">랜딩 페이지 영구 삭제</h2>
        <p className="mt-1 text-sm text-red-800/80">
          목록 제거와 달리 페이지 URL 자체가 삭제됩니다. 꼭 필요할 때만 사용하세요.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="permanent-delete-url" className="mb-1 block text-xs font-medium text-red-900">
            페이지 주소
          </label>
          <input
            id="permanent-delete-url"
            type="text"
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            placeholder="https://neva.dmcmusic.co.kr/landing/슬러그 또는 /landing/슬러그"
            className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !pageUrl.trim()}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-40"
        >
          {loading ? "삭제 중…" : "페이지 영구 삭제"}
        </button>
      </form>
    </div>
  );
}
