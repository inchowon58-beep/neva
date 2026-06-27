"use client";

import { FormEvent, useState } from "react";

interface ConsultationFormProps {
  keyword: string;
  companyName: string;
  phone?: string;
}

export default function ConsultationForm({
  keyword,
  companyName,
  phone,
}: ConsultationFormProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contact,
          message,
          keyword,
          companyName,
        }),
      });

      if (!res.ok) throw new Error("failed");
      setStatus("success");
      setName("");
      setContact("");
      setMessage("");
    } catch {
      if (phone) {
        window.location.href = `tel:${phone.replace(/[^0-9+]/g, "")}`;
      }
      setStatus("error");
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-[#e8e0d4] bg-white p-8 shadow-sm sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b7355]">
        Adoption Inquiry
      </p>
      <h3 className="mt-2 font-serif text-2xl text-[#2c2420]">분양 상담 신청</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6b5d4d]">
        {keyword} 입양을 고민 중이시라면 간단히 남겨 주세요. {companyName}에서 빠르게
        연락드리겠습니다.
      </p>

      {status === "success" ? (
        <div className="mt-8 rounded-2xl bg-[#f5f0e8] px-6 py-8 text-center">
          <p className="font-serif text-lg text-[#2c2420]">상담 신청이 접수되었습니다</p>
          <p className="mt-2 text-sm text-[#6b5d4d]">담당자 확인 후 연락드리겠습니다.</p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-6 rounded-2xl bg-[#2c2420] px-6 py-2.5 text-sm text-[#f5f0e8] transition hover:bg-[#3d3429]"
          >
            추가 문의하기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="inquiry-name" className="mb-1.5 block text-sm font-medium text-[#3d3429]">
              이름
            </label>
            <input
              id="inquiry-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full rounded-2xl border border-[#e8e0d4] bg-[#faf8f5] px-4 py-3 text-[#2c2420] outline-none transition focus:border-[#c4a574] focus:ring-2 focus:ring-[#c4a574]/20"
            />
          </div>
          <div>
            <label htmlFor="inquiry-contact" className="mb-1.5 block text-sm font-medium text-[#3d3429]">
              연락처
            </label>
            <input
              id="inquiry-contact"
              type="tel"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full rounded-2xl border border-[#e8e0d4] bg-[#faf8f5] px-4 py-3 text-[#2c2420] outline-none transition focus:border-[#c4a574] focus:ring-2 focus:ring-[#c4a574]/20"
            />
          </div>
          <div>
            <label htmlFor="inquiry-message" className="mb-1.5 block text-sm font-medium text-[#3d3429]">
              문의 내용
            </label>
            <textarea
              id="inquiry-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`${keyword} 분양 일정, 건강 상태, 방문 상담 등 궁금한 점을 적어 주세요.`}
              className="w-full resize-none rounded-2xl border border-[#e8e0d4] bg-[#faf8f5] px-4 py-3 text-[#2c2420] outline-none transition focus:border-[#c4a574] focus:ring-2 focus:ring-[#c4a574]/20"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-2xl bg-[#c4a574] py-3.5 text-sm font-semibold tracking-wide text-[#1a1612] transition hover:bg-[#d4b584] disabled:opacity-60"
          >
            {status === "loading" ? "전송 중…" : "분양 상담 신청하기"}
          </button>
        </form>
      )}
    </div>
  );
}
