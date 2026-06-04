import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "~/lib/auth/session";
import { AdminSidebar } from "~/components/admin/sidebar";
import { seedSkillGroups } from "~/lib/seed/skill-groups";
import { seedAdminUsers } from "~/lib/seed/admin-users";
import { seedTracks } from "~/lib/seed/tracks";
import { AdminLayoutWrapper } from ".//_components/admin-layout-wrapper";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  if (user.role !== "admin" && user.role !== "superadmin") redirect("/dashboard");

  await seedAdminUsers();
  await seedSkillGroups();
  await seedTracks();

  return (
    <AdminLayoutWrapper>
      <div className="flex min-h-screen bg-background text-foreground">
        <AdminSidebar isSuperAdmin={user.role === "superadmin"} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-6">
            <p className="text-sm font-medium text-muted-foreground">Admin Console</p>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-muted-foreground sm:block">{user.email}</span>
              <Link
                href="/dashboard"
                className="rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                ← Back to app
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 bg-muted/20 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
