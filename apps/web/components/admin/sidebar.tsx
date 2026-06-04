"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Tag,
  CreditCard,
  Activity,
  MessageSquare,
  LayoutDashboard,
  ChevronRight,
  GraduationCap,
  Layers,
  BookOpen,
  FileText,
  Stethoscope,
} from "lucide-react";
import { cn } from "~/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Diagnostics", href: "/admin/diagnostics", icon: Stethoscope },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Skill Group Approvals", href: "/admin/approvals", icon: Tag },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "AI Health", href: "/admin/ai-health", icon: Activity },
  { label: "Blog Posts", href: "/admin/blog-posts", icon: FileText },
  { label: "Blog Comments", href: "/admin/blog", icon: MessageSquare },
  { label: "Tracks", href: "/admin/tracks", icon: Layers },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Audit Log", href: "/admin/audit", icon: Activity },
  { label: "Tutors", href: "/admin/tutors", icon: GraduationCap, superadminOnly: true },
];

interface AdminSidebarProps {
  isSuperAdmin?: boolean;
}

export function AdminSidebar({ isSuperAdmin = false }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-gray-200 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green">
          <LayoutDashboard className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight text-gray-900">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV.map(({ label, href, icon: Icon, superadminOnly }) => {
          if (superadminOnly && !isSuperAdmin) return null;
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-green-50 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-brand-green" : "text-gray-400 group-hover:text-gray-600",
                )}
              />
              {label}
              {active && <ChevronRight className="ml-auto h-3 w-3 text-gray-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-200 p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 transition hover:text-gray-700"
        >
          ← Back to app
        </Link>
      </div>
    </aside>
  );
}

