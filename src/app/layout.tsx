import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "네바마스커레이드분양 | 키워드 랜딩페이지 자동 생성 서비스",
  description:
    "네바마스커레이드 키워드와 이미지 조합으로 네이버 웹문서 대량 노출. SEO 최적화 맞춤형 서브 랜딩페이지를 실시간 자동 생성합니다.",
  keywords: ["네바마스커레이드분양", "네바마스커레이드", "SEO", "랜딩페이지", "구글", "네이버"],
  openGraph: {
    title: "네바마스커레이드분양 | 랜딩페이지 자동 생성",
    description: "키워드, 이미지, 기본 정보만 입력하면 SEO 최적화 랜딩페이지가 자동 생성됩니다.",
    type: "website",
    locale: "ko_KR",
  },
  verification: {
    other: {
      "naver-site-verification": "e7b610b84b1270c6676af99949e202a0beaee60b",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
        <Footer />
      </body>
    </html>
  );
}
