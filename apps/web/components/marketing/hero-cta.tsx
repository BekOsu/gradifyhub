"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useSession } from "~/lib/auth/client";

export function HeroCta({
  label,
  initialIsLoggedIn = false,
}: {
  label: string;
  initialIsLoggedIn?: boolean;
}) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user || initialIsLoggedIn;
  const href = isLoggedIn ? "/assessment" : "/sign-up?next=/onboarding";

  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:bg-brand-green/90 hover:shadow-lg hover:shadow-brand-green/25 active:scale-[0.98]"
    >
      {label}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}
