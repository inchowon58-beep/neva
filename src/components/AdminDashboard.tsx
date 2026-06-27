"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { formatDate } from "@/lib/constants";
import { DEFAULT_PROMPT } from "@/lib/gemini";
import { MAX_KEYWORD_IMPORT, parseKeywordTxt } from "@/lib/keyword-import";
import type { KeywordEntry, MainPageLink } from "@/types";

interface KeywordFormData {
  keyword: string;
  companyName: string;
  imageUrl: string;
  homepageUrl: string;
  phone: string;
  pagePrompt: string;
}

const emptyForm: KeywordFormData = {
  keyword: "",
  companyName: "",
  imageUrl: "",
  homepageUrl: "",
  phone: "",
  pagePrompt: "",
};

const emptyMainPageForm = { keyword: "", path: "" };

interface IndexNowResponse {
  ok?: boolean;
  skipped?: boolean;
  error?: string;
  submitted?: number;
  skippedCount?: number;
  message?: string;
}

function indexNowSuffix(indexNow?: IndexNowResponse | null): string {
  if (!indexNow) return "";
  if (indexNow.skipped && indexNow.message) return ` · ${indexNow.message}`;
  if (indexNow.skipped) return "";
  if (indexNow.ok) return " · 네이버 IndexNow 알림 완료";
  return ` · IndexNow 실패: ${indexNow.error || "알 수 없음"}`;
}

export default function AdminDashboard() {
  const [keywords, setKeywords] = useState<KeywordEntry[]>([]);
  const [mainPages, setMainPages] = useState<MainPageLink[]>([]);
  const [form, setForm] = useState<KeywordFormData>(emptyForm);
  const [mainPageForm, setMainPageForm] = useState(emptyMainPageForm);
  const [editingMainPageId, setEditingMainPageId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [indexNowLoading, setIndexNowLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreview, setImportPreview] = useState<string[]>([]);
  const [importFileName, setImportFileName] = useState("");

  const fetchKeywords = async () => {
    const [kwRes, mpRes] = await Promise.all([
      fetch("/api/keywords"),
      fetch("/api/main-pages"),
    ]);
    if (kwRes.ok) {
      const data = await kwRes.json();
      setKeywords(data.keywords);
    }
    if (mpRes.ok) {
      const data = await mpRes.json();
      setMainPages(data.mainPages);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const showMessage = (text: string, ms = 5000) => {
    setMessage(text);
    setTimeout(() => setMessage(""), ms);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const url = "/api/keywords";
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { id: editingId, ...form } : form;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      const kw = data.keyword as KeywordEntry | undefined;
      let msg = editingId ? "키워드가 수정되었습니다." : "키워드가 등록되었습니다.";
      if (!editingId && kw && form.keyword.trim() !== kw.keyword) {
        msg += ` 중복 키워드 → '${kw.keyword}' (슬러그: ${kw.slug})`;
      }
      showMessage(msg + indexNowSuffix(data.indexNow));
      setForm(emptyForm);
      setEditingId(null);
      fetchKeywords();
    } else {
      showMessage(data.error || "오류가 발생했습니다.");
    }
  };

  const handleEdit = (entry: KeywordEntry) => {
    setEditingId(entry.id);
    setForm({
      keyword: entry.keyword,
      companyName: entry.companyName,
      imageUrl: entry.imageUrl,
      homepageUrl: entry.homepageUrl,
      phone: entry.phone,
      pagePrompt: entry.pagePrompt,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/keywords?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      showMessage("삭제되었습니다.");
      fetchKeywords();
    }
  };

  const handleGenerate = async (id: string) => {
    setGeneratingId(id);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setGeneratingId(null);

    if (res.ok) {
      const data = await res.json();
      showMessage("Gemini AI 콘텐츠가 생성되었습니다." + indexNowSuffix(data.indexNow));
      fetchKeywords();
    } else {
      const data = await res.json();
      showMessage(data.error || "콘텐츠 생성 실패");
    }
  };

  const handleIndexNowBulk = async () => {
    setIndexNowLoading(true);
    const res = await fetch("/api/indexnow", { method: "POST" });
    const data = await res.json();
    setIndexNowLoading(false);

    if (res.ok && data.success) {
      const sent = data.urlCount ?? 0;
      const skipped = data.skippedCount ?? 0;
      if (sent === 0 && skipped > 0) {
        showMessage(`IndexNow: 전송 대상 없음 (${skipped}개는 24시간 내 이미 전송됨)`);
      } else {
        showMessage(
          `네이버 IndexNow 일괄 전송 완료 (${sent}개 전송${skipped > 0 ? ` · ${skipped}개 생략` : ""})`
        );
      }
    } else {
      showMessage(data.error || data.indexNow?.error || "IndexNow 전송 실패");
    }
  };

  const handleImportFile = async (file: File | null) => {
    if (!file) {
      setImportPreview([]);
      setImportFileName("");
      return;
    }
    const text = await file.text();
    const parsed = parseKeywordTxt(text);
    setImportPreview(parsed);
    setImportFileName(file.name);
  };

  const handleImportSubmit = async () => {
    if (importPreview.length === 0) {
      showMessage("txt 파일에 등록할 키워드가 없습니다.");
      return;
    }
    if (
      !confirm(
        `${importPreview.length}개 키워드를 등록하고 IndexNow로 알릴까요?\n(위 폼의 업체명·이미지 URL 등이 공통 적용됩니다)`
      )
    ) {
      return;
    }

    setImportLoading(true);
    const fd = new FormData();
    fd.append("text", importPreview.join("\n"));
    fd.append("companyName", form.companyName);
    fd.append("imageUrl", form.imageUrl);
    fd.append("homepageUrl", form.homepageUrl);
    fd.append("phone", form.phone);
    fd.append("pagePrompt", form.pagePrompt);

    const res = await fetch("/api/keywords/import", { method: "POST", body: fd });
    const data = await res.json();
    setImportLoading(false);

    if (res.ok) {
      let msg = `${data.createdCount}개 키워드 일괄 등록 완료`;
      if (data.indexNow?.ok) {
        msg += ` · IndexNow ${data.indexNow.submitted ?? data.createdCount}개 URL 알림`;
      } else if (data.indexNow?.error) {
        msg += ` · IndexNow: ${data.indexNow.error}`;
      }
      showMessage(msg, 8000);
      setImportPreview([]);
      setImportFileName("");
      fetchKeywords();
    } else {
      showMessage(data.error || "일괄 등록 실패", 8000);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleMainPageSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const url = "/api/main-pages";
    const method = editingMainPageId ? "PUT" : "POST";
    const body = editingMainPageId ? { id: editingMainPageId, ...mainPageForm } : mainPageForm;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      showMessage(editingMainPageId ? "메인 페이지가 수정되었습니다." : "메인 페이지가 등록되었습니다.");
      setMainPageForm(emptyMainPageForm);
      setEditingMainPageId(null);
      fetchKeywords();
    } else {
      showMessage(data.error || "오류가 발생했습니다.");
    }
  };

  const handleMainPageEdit = (page: MainPageLink) => {
    setEditingMainPageId(page.id);
    setMainPageForm({ keyword: page.keyword, path: page.path });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMainPageDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/main-pages?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      showMessage("메인 페이지가 삭제되었습니다.");
      fetchKeywords();
    }
  };

  const cancelMainPageEdit = () => {
    setEditingMainPageId(null);
    setMainPageForm(emptyMainPageForm);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">키워드 관리</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleIndexNowBulk}
            disabled={indexNowLoading}
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
          >
            {indexNowLoading ? "IndexNow 전송 중..." : "IndexNow 일괄 전송 (미전송분)"}
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            메인으로 가기
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            로그아웃
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div>
      )}

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-sm text-emerald-900">
        <p className="font-semibold text-emerald-800">네이버 IndexNow (자동 수집 알림)</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-emerald-900/90">
          <li>
            <strong>새 키워드 등록</strong> · <strong>AI 콘텐츠 생성</strong> 시 자동 전송 (별도
            일괄전송 불필요)
          </li>
          <li>같은 URL은 <strong>24시간 내 재전송하지 않음</strong> (매일 반복 불필요)</li>
          <li>수집·검색 노출은 네이버 처리에 <strong>며칠~수 주</strong> 걸릴 수 있음</li>
          <li>
            「일괄 전송 완료」= IndexNow 연동 성공 · <strong>초기 1회</strong> 또는 미전송 페이지
            보충용
          </li>
          <li>
            서치어드바이저 <strong>수동 수집요청(하루 ~50건)</strong>과 IndexNow는{" "}
            <strong>별도</strong> · txt로 1000개 등록·IndexNow 1회 전송 가능 (수집·노출은 네이버
            처리)
          </li>
        </ul>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? "키워드 수정" : "새 키워드 등록"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              키워드 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.keyword}
              onChange={(e) => setForm({ ...form, keyword: e.target.value })}
              placeholder="예: 인천네바마스커레이드분양"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="mt-1 text-xs text-slate-500">
              등록·AI 생성 시 IndexNow로 네이버에 자동 알림됩니다. 슬러그만 바뀔 때만 수정 시
              재전송됩니다.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">업체명</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="예: 네바 마스커레이드"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">이미지 URL</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg 또는 폴더 URL"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="mt-1 text-xs text-slate-500">
              폴더 URL 입력 시 해당 폴더에서 이미지를 랜덤으로 사용합니다.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">홈페이지 URL</label>
            <input
              type="url"
              value={form.homepageUrl}
              onChange={(e) => setForm({ ...form, homepageUrl: e.target.value })}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">전화번호</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-1234-5678"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              페이지 생성 기본 내용설정
            </label>
            <textarea
              value={form.pagePrompt}
              onChange={(e) => setForm({ ...form, pagePrompt: e.target.value })}
              rows={8}
              placeholder={DEFAULT_PROMPT}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="mt-1 text-xs text-slate-500">
              Gemini API 페이지 생성 시 전달되는 프롬프트입니다. 비워두면 반려동물/품종 SEO
              기본 프롬프트가 사용됩니다. 키워드·업체명·연락처는 자동으로 함께 전달됩니다.
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-500"
          >
            {editingId ? "수정하기" : "등록하기"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-slate-300 px-6 py-2.5 text-slate-600 hover:bg-slate-50"
            >
              취소
            </button>
          )}
        </div>
      </form>

      {/* TXT bulk import */}
      <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-violet-950">txt 파일 일괄 등록</h2>
        <p className="mt-1 text-sm text-violet-900/80">
          txt 파일 <strong>한 줄에 키워드 1개</strong>. 빈 줄·<code>#</code> 주석은 무시합니다. 최대{" "}
          {MAX_KEYWORD_IMPORT}개. 위 등록 폼의 업체명·이미지 URL·전화번호가 전체에 공통 적용됩니다.
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-violet-900">키워드 txt 파일</label>
            <input
              type="file"
              accept=".txt,text/plain"
              onChange={(e) => handleImportFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-violet-500"
            />
            {importFileName && (
              <p className="mt-2 text-sm text-violet-800">
                {importFileName} · <strong>{importPreview.length}개</strong> 키워드 인식
                {importPreview.length > 0 && (
                  <span className="ml-2 text-violet-600">
                    (예: {importPreview.slice(0, 3).join(", ")}
                    {importPreview.length > 3 ? " …" : ""})
                  </span>
                )}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={importLoading || importPreview.length === 0}
            onClick={handleImportSubmit}
            className="rounded-lg bg-violet-600 px-6 py-2.5 font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {importLoading ? "등록 중..." : `${importPreview.length || ""}개 일괄 등록`}
          </button>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-white/80 p-3 text-xs text-slate-600">
{`# keywords.txt 예시
안양네바마스커레이드분양
시흥네바마스커레이드분양
수원고양이분양`}
        </pre>
      </div>

      {/* Keyword List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">등록된 키워드 ({keywords.length})</h2>
        </div>
        {keywords.length === 0 ? (
          <p className="px-6 py-12 text-center text-slate-500">등록된 키워드가 없습니다.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {keywords.map((entry) => (
              <div key={entry.id} className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{entry.keyword}</p>
                  <p className="text-sm text-blue-600">/landing/{entry.slug}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-500">
                    <span>{formatDate(entry.createdAt)}</span>
                    {entry.companyName && <span>{entry.companyName}</span>}
                    {entry.phone && <span>📞 {entry.phone}</span>}
                    {entry.homepageUrl && <span>🔗 {entry.homepageUrl}</span>}
                    {entry.generatedContent ? (
                      <span className="text-green-600">✓ AI 콘텐츠 생성됨</span>
                    ) : (
                      <span className="text-amber-600">⚠ 콘텐츠 미생성</span>
                    )}
                    {entry.pagePrompt && <span className="text-blue-600">✓ 커스텀 프롬프트</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/landing/${encodeURIComponent(entry.slug)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    미리보기
                  </a>
                  <button
                    onClick={() => handleGenerate(entry.id)}
                    disabled={generatingId === entry.id}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {generatingId === entry.id ? "생성 중..." : "AI 콘텐츠 생성"}
                  </button>
                  <button
                    onClick={() => handleEdit(entry)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
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

      {/* Main Page Links */}
      <form
        onSubmit={handleMainPageSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-1 text-lg font-semibold">
          {editingMainPageId ? "메인 페이지 수정" : "메인 페이지 등록"}
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          지금의 메인페이지처럼 키워드별 메인 허브 페이지 링크를 등록합니다. 등록하면 상단
          「다른 키워드 랜딩페이지」 선택 목록에 표시됩니다.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              키워드명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={mainPageForm.keyword}
              onChange={(e) => setMainPageForm({ ...mainPageForm, keyword: e.target.value })}
              placeholder="예: 인천네바마스커레이드"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              페이지 경로 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={mainPageForm.path}
              onChange={(e) => setMainPageForm({ ...mainPageForm, path: e.target.value })}
              placeholder="예: / 또는 /pages/인천"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-500"
          >
            {editingMainPageId ? "수정하기" : "등록하기"}
          </button>
          {editingMainPageId && (
            <button
              type="button"
              onClick={cancelMainPageEdit}
              className="rounded-lg border border-slate-300 px-6 py-2.5 text-slate-600 hover:bg-slate-50"
            >
              취소
            </button>
          )}
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">등록된 메인 페이지 ({mainPages.length})</h2>
        </div>
        {mainPages.length === 0 ? (
          <p className="px-6 py-12 text-center text-slate-500">
            등록된 메인 페이지가 없습니다. 추후 추가될 페이지 링크를 여기서 등록하세요.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {mainPages.map((page) => (
              <div
                key={page.id}
                className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{page.keyword}</p>
                  <p className="text-sm text-blue-600">{page.path}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(page.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMainPageEdit(page)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMainPageDelete(page.id)}
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
