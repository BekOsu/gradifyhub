"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "~/lib/auth/client";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  ChevronDown,
  BarChart2,
  User,
  Users,
  CreditCard,
  Zap,
  ArrowRight,
} from "lucide-react";

type MarketingNavUser = {
  name: string | null;
  email: string;
} | null;

export function MarketingNav({ initialUser = null }: { initialUser?: MarketingNavUser }) {
  const { data: session } = useSession();
  const user = session?.user ?? initialUser;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-7">
          <Link href="/" className="text-sm font-bold tracking-tight text-foreground">
            <span className="text-brand-green">G</span>radifyHub
          </Link>

          <div className="hidden items-center gap-0.5 md:flex">
            {[
              { href: "/#how-it-works", label: "How it works" },
              { href: "/roadmaps", label: "Roadmaps" },
              { href: "/courses", label: "Courses" },
              { href: "/about", label: "About" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/pricing"
              className="ml-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-green transition-colors hover:bg-brand-green/8"
            >
              <Zap className="h-3.5 w-3.5" />
              Upgrade
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div ref={menuRef} className="relative flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-green px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-green/90 active:scale-[0.98] sm:px-4 sm:py-2 sm:text-sm"
              >
                Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-1.5 text-sm font-medium transition-all hover:bg-muted"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-[10px] font-bold text-white">
                  {initials}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm sm:block">
                  {user.name ?? user.email}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <div className="animate-fade-up absolute right-0 top-full mt-2 w-52 rounded-2xl border border-border/70 bg-background shadow-xl [animation-duration:150ms]">
                  <div className="border-b border-border/60 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    {[
                      { href: "/account", icon: BarChart2, label: "Activity" },
                      { href: "/account/profile", icon: User, label: "Profile" },
                      { href: "/account/friends", icon: Users, label: "Friends" },
                      { href: "/account/billing", icon: CreditCard, label: "Billing" },
                      { href: "/account/settings", icon: Settings, label: "Settings" },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted"
                      >
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        {label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-border/60 p-1.5">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/8"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-xl px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-xl bg-foreground px-4 py-1.5 text-sm font-semibold text-background transition-all hover:bg-foreground/90 active:scale-[0.98]"
              >
                <span className="hidden sm:inline">Get started free</span>
                <span className="sm:hidden">Sign up</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
