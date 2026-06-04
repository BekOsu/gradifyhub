import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "~/lib/auth/session";
import { TutorSidebar } from "./_components/tutor-sidebar";
import { ToastProvider } from "~/app/admin/_components/toast-context";
import { ToastContainer } from "~/app/admin/_components/toast-container";

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  if (user.role !== "tutor") redirect("/dashboard");

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-white text-gray-900">
        <TutorSidebar userName={user.name || user.email} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
            <p className="text-sm text-gray-500">Tutor Dashboard</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-gray-500 sm:block">{user.email}</span>
                <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  Tutor
                </span>
              </div>
              <Link
                href="/dashboard"
                className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
              >
                ← App
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 bg-gray-50 lg:p-8">{children}</main>
        </div>
      </div>
      <ToastContainer />
    </ToastProvider>
  );
}
