export interface InquiryNotifyPayload {
  name: string;
  contact: string;
  message: string;
  keyword: string;
  companyName: string;
}

export interface DiscordNotifyResult {
  ok: boolean;
  channel: "discord" | "none";
  error?: string;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

/** Discord 웹훅으로 분양 상담 접수 알림 (무료) */
export async function sendInquiryNotification(
  payload: InquiryNotifyPayload
): Promise<DiscordNotifyResult> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    return { ok: false, channel: "none", error: "DISCORD_WEBHOOK_URL 미설정" };
  }

  const createdAt = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  const embed = {
    title: "🐱 분양 상담 신청",
    color: 0xc4a574,
    fields: [
      { name: "페이지 키워드", value: payload.keyword || "-", inline: false },
      { name: "이름", value: payload.name, inline: true },
      { name: "연락처", value: payload.contact, inline: true },
      { name: "업체명", value: payload.companyName || "-", inline: true },
      {
        name: "문의 내용",
        value: truncate(payload.message || "(없음)", 1000),
        inline: false,
      },
    ],
    footer: { text: `접수 시각 · ${createdAt}` },
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "분양 상담 알림",
        embeds: [embed],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        channel: "discord",
        error: text || `Discord HTTP ${res.status}`,
      };
    }

    return { ok: true, channel: "discord" };
  } catch (err) {
    return {
      ok: false,
      channel: "discord",
      error: err instanceof Error ? err.message : "Discord 알림 발송 실패",
    };
  }
}

export function isDiscordNotifyConfigured(): boolean {
  return Boolean(process.env.DISCORD_WEBHOOK_URL?.trim());
}
