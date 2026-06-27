import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { sendInquiryNotification } from "@/lib/notifications/discord";

const DATA_DIR = path.join(process.cwd(), "data");
const INQUIRY_FILE = path.join(DATA_DIR, "inquiries.json");

interface InquiryPayload {
  name: string;
  contact: string;
  message: string;
  keyword: string;
  companyName: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InquiryPayload;
    const { name, contact, message, keyword, companyName } = body;

    if (!name?.trim() || !contact?.trim()) {
      return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
    }

    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      contact: contact.trim(),
      message: message?.trim() || "",
      keyword: keyword?.trim() || "",
      companyName: companyName?.trim() || "",
      createdAt: new Date().toISOString(),
    };

    await fs.mkdir(DATA_DIR, { recursive: true });

    let inquiries: (typeof record)[] = [];
    try {
      const raw = await fs.readFile(INQUIRY_FILE, "utf-8");
      inquiries = JSON.parse(raw);
    } catch {
      inquiries = [];
    }

    inquiries.unshift(record);
    await fs.writeFile(
      INQUIRY_FILE,
      JSON.stringify(inquiries.slice(0, 500), null, 2),
      "utf-8"
    );

    const notify = await sendInquiryNotification({
      name: record.name,
      contact: record.contact,
      message: record.message,
      keyword: record.keyword,
      companyName: record.companyName,
    });

    return NextResponse.json({
      success: true,
      notified: notify.ok,
      notifyChannel: notify.channel,
    });
  } catch {
    return NextResponse.json({ error: "상담 접수에 실패했습니다." }, { status: 500 });
  }
}
