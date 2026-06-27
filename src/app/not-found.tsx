import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="mt-4 text-slate-600">요청하신 페이지를 찾을 수 없습니다.</p>
      <Link href="/" className="mt-8 text-blue-600 hover:underline">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
