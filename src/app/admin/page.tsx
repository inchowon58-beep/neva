import AdminLoginForm from "@/components/AdminLoginForm";

export const metadata = {
  title: "관리자 | 네바 마스커레이드 분양",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4">
        <AdminLoginForm />
      </div>
    </main>
  );
}
