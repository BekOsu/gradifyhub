"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { cn } from "~/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/tutor/students", icon: Users },
  { label: "Pending Approvals", href: "/tutor/approvals", icon: CheckCircle2 },
  { label: "Messages", href: "/tutor/messages", icon: MessageSquare },
];

type TutorSidebarProps = {
  userName: string;
};

export function TutorSidebar({ userName }: TutorSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-gray-200 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
          <LayoutDashboard className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight text-gray-900">
          Tutor
        </span>
      </div>

      {/* User info */}
      <div className="border-b border-gray-200 px-5 py-3">
        <p className="text-xs font-medium text-gray-700">Logged in as</p>
        <p className="mt-1 truncate text-sm font-medium text-gray-900">
          {userName}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-blue-50 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
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
