"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import {
  BarChart2,
  User,
  Users,
  CreditCard,
  Settings,
} from "lucide-react";

const subNav = [
  { label: "Activity",  href: "/account",           icon: BarChart2 },
  { label: "Profile",   href: "/account/profile",   icon: User },
  { label: "Friends",   href: "/account/friends",   icon: Users },
  { label: "Billing",   href: "/account/billing",   icon: CreditCard },
  { label: "Settings",  href: "/account/settings",  icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/account") return pathname === "/account";
    return pathname.startsWith(href);
  }

  return (
    <div className="w-full">
      {/* Horizontal tab navigation */}
      <div className="border-b border-border mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {subNav.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                isActive(href)
                  ? "border-brand-green text-brand-green"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-3xl">{children}</div>
    </div>
  );
}