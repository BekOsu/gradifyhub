"use client";

import { Avatar } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { signOut } from "~/lib/auth/client";
import { cn } from "~/lib/utils";
import {
  LayoutDashboard,
  Brain,
  Map,
  FileText,
  Settings,
  LogOut,
  Zap,
  MessageSquare,
  DollarSign,
  Rss,
  Flame,
  BarChart2,
  User,
  CreditCard,
  ChevronUp,
  Users,
  Lock,
  GraduationCap,
  BookOpen,
  BookMarked,
  RotateCcw,
  Mic,
  Menu,
  X,
  Puzzle,
} from "lucide-react";
import type { JourneyUnlocks } from "~/lib/journey/unlocks";
import { useSidebar } from "~/lib/sidebar/context";

const mainNav = [
  { label: "Dashboard", href: "/dashboard",  icon: LayoutDashboard },
  { label: "Assessment",     href: "/assessment", icon: Brain },
  { label: "Roadmap",     href: "/roadmap",    icon: Map },
  // { label: "Catalog",   href: "/roadmaps",   icon: Globe }, // TODO: Hide until ready
  { label: "Resume",    href: "/resume",     icon: FileText },
];

const utilityNav = [
  { label: "Blog",       href: "/blog",        icon: Rss },
  { label: "Pricing",    href: "/pricing",     icon: DollarSign },
  { label: "Courses",    href: "/courses",     icon: GraduationCap },
  { label: "Community",  href: "/community",   icon: MessageSquare },
];

const bottomNav = [
  { label: "Usage",     href: "/usage",            icon: BarChart2 },
  { label: "Settings",  href: "/account/settings", icon: Settings },
];

// Maps sidebar href → which journey unlock index gates it, where to redirect if locked, and what hint to show
const NAV_LOCK: Record<string, { index: number; to: string; hint: string }> = {
  "/assessment": { index: 1, to: "/onboarding/step-1", hint: "Set up your profile first" },
  "/roadmap":    { index: 2, to: "/assessment",         hint: "Complete your Assessment first" },
  "/resume":     { index: 6, to: "/interview-prep",     hint: "Complete an Interview Prep session first" },
};

interface AppSidebarProps {
  user: { name: string | null; email: string; image?: string | null };
  plan: "free" | "pro";
  streakDays: number;
  userRole?: string;
  journeyUnlocks?: JourneyUnlocks;
  goalTrack?: string;
  primaryTrackSlug?: string;
}

export function AppSidebar({ user, plan, streakDays, userRole, journeyUnlocks, goalTrack, primaryTrackSlug }: AppSidebarProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isOpen, toggle } = useSidebar();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    await signOut();
    window.location.href = "/";
  }

  function isActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className={cn(
        "flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
        isOpen ? "w-60" : "w-20"
      )}>
        {/* Brand */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
          <div className={cn("flex items-center gap-2.5 min-w-0 overflow-hidden transition-opacity duration-300", !isOpen && "opacity-0 pointer-events-none")}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green text-white shrink-0">
              <Zap className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <Link href="/" className="text-sm font-bold tracking-tight whitespace-nowrap">
                GradifyHub
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant={plan === "pro" ? "green" : "neutral"}>
                  {plan === "pro" ? "Pro" : "Free"}
                </Badge>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 whitespace-nowrap">
                  <Flame className="h-3 w-3" /> Streak: {streakDays}d
                </span>
              </div>
              {goalTrack && (
                <p className="mt-1 truncate text-[11px] font-medium text-brand-green">
                  {goalTrack}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors shrink-0 ml-2"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          <div className="space-y-0.5">
            {mainNav.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              const lockCfg = NAV_LOCK[href];
              const isLocked = lockCfg ? !(journeyUnlocks?.[lockCfg.index] ?? true) : false;

              if (isLocked && lockCfg) {
                return (
                  <a
                    key={href}
                    href={lockCfg.to}
                    title={lockCfg.hint}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/50 transition-all duration-150 hover:bg-muted hover:text-muted-foreground min-w-0"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                    <span className={cn("flex-1 transition-all duration-300 whitespace-nowrap overflow-hidden", isOpen ? "" : "hidden w-0")}>{label}</span>
                    <Lock className={cn("h-3 w-3 shrink-0 text-muted-foreground/30 transition-all duration-300", isOpen ? "" : "hidden")} />
                  </a>
                );
              }

              return (
                <Link
                  key={href}
                  href={href}
                  title={!isOpen ? label : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 min-w-0",
                    isOpen ? "justify-start" : "justify-center",
                    active
                      ? "bg-brand-green/10 text-brand-green"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-brand-green" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className={cn("flex-1 transition-all duration-300 whitespace-nowrap overflow-hidden", isOpen ? "" : "hidden w-0")}>{label}</span>
                </Link>
              );
            })}
            {userRole === "tutor" && (
              <Link
                href="/tutor/dashboard"
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 min-w-0",
                  isOpen ? "justify-start" : "justify-center",
                  isActive("/tutor/dashboard")
                    ? "bg-brand-green/10 text-brand-green"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <LayoutDashboard className={cn("h-4 w-4 shrink-0 transition-colors", isActive("/tutor/dashboard") ? "text-brand-green" : "text-muted-foreground group-hover:text-foreground")} />
                <span className={cn("flex-1 transition-all duration-300 whitespace-nowrap overflow-hidden", isOpen ? "" : "hidden w-0")}>Tutor Dashboard</span>
              </Link>
            )}
          </div>

          {/* Track switcher */}
          <div className={cn("mt-4 space-y-1 transition-all duration-300", isOpen ? "" : "opacity-0 pointer-events-none")}>
            <div className="mb-1.5 flex items-center justify-between px-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                Tracks
              </p>
              <Link
                href="/tracks"
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive("/tracks") ? "text-brand-green" : "text-muted-foreground/60 hover:text-muted-foreground",
                )}
              >
                All →
              </Link>
            </div>

            {(
              [
                { slug: "ai-engineer",  label: "AI Engineer", href: "/roadmap?track=ai-engineer", Icon: Brain },
                { slug: "soft-skills",  label: "Soft Skills",  href: "/roadmap?track=soft-skills",  Icon: BookOpen },
              ] as const
            ).map(({ slug, label, href, Icon }, i) => {
              const isPrimary       = primaryTrackSlug === slug;
              const isSupplementary = !!primaryTrackSlug && !isPrimary;
              const showDivider     = i === 1 && !!primaryTrackSlug && primaryTrackSlug === "ai-engineer";
              return (
                <div key={slug}>
                  {showDivider && <div className="mx-3 my-1 border-t border-border/40" />}
                  <Link
                    href={href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-all duration-150 hover:bg-muted hover:text-foreground",
                      isPrimary       ? "font-semibold text-foreground" :
                      isSupplementary ? "text-muted-foreground/60"      :
                                        "font-medium text-muted-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                    {isPrimary && (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* English Proficiency */}
          <div className={cn("mt-4 space-y-1 transition-all duration-300", isOpen ? "" : "opacity-0 pointer-events-none")}>
            <div className="mb-1.5 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                English Proficiency
              </p>
            </div>
            {(
              [
                { label: "Overview",   href: "/roadmap?track=english-proficiency", Icon: Map },
                { label: "Vocabulary", href: "/english/vocab",         Icon: BookMarked },
                { label: "Review",     href: "/english/vocab/review",  Icon: RotateCcw },
                { label: "Shadowing",  href: "/english/shadow",        Icon: Mic },
                { label: "Speaking",   href: "/english/speak",         Icon: MessageSquare },
                { label: "Analytics",  href: "/english/analytics",     Icon: BarChart2 },
                { label: "Extension",  href: "/english/extension",     Icon: Puzzle },
              ] as const
            ).map(({ label, href, Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={!isOpen ? label : undefined}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-all duration-150 hover:bg-muted hover:text-foreground",
                    active ? "font-semibold text-foreground bg-muted" : "font-medium text-muted-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className={cn("transition-all duration-300 whitespace-nowrap overflow-hidden", isOpen ? "" : "hidden w-0")}>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Divider + utility links */}
          <div className="mt-4 space-y-0.5">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Explore
            </p>
            {utilityNav.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={!isOpen ? label : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 min-w-0",
                    isOpen ? "justify-start" : "justify-center",
                    active
                      ? "bg-brand-green/10 text-brand-green"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-brand-green" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className={cn("flex-1 transition-all duration-300 whitespace-nowrap overflow-hidden", isOpen ? "" : "hidden w-0")}>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Settings below the fold */}
          <div className="mt-4 space-y-0.5">
            {bottomNav.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={!isOpen ? label : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 min-w-0",
                    isOpen ? "justify-start" : "justify-center",
                    active
                      ? "bg-brand-green/10 text-brand-green"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-brand-green" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className={cn("flex-1 transition-all duration-300 whitespace-nowrap overflow-hidden", isOpen ? "" : "hidden w-0")}>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Upgrade CTA + user footer — wrapped together so the dropdown clears the upgrade button */}
        <div className="relative shrink-0" ref={menuRef}>
          {/* Dropdown panel */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-1 overflow-hidden rounded-xl border bg-popover shadow-lg">
              <div className="p-1">
                <Link
                  href="/account"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  Activity
                </Link>
                <Link
                  href="/account/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  Profile
                </Link>
                <Link
                  href="/account/friends"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Friends
                </Link>
                <Link
                  href="/account/billing"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Billing
                </Link>
                <Link
                  href="/account/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </Link>
              </div>
              <div className="border-t p-1">
                <button
                  type="button"
                  onClick={() => { void handleSignOut(); }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign out
                </button>
              </div>
            </div>
          )}

          {plan === "free" && (
            <div className="px-3 pb-2">
              <Link
                href="/pricing"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Zap className="h-4 w-4" />
                Upgrade to Pro
              </Link>
            </div>
          )}

          {/* User trigger button */}
          <div className="border-t p-3">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex w-full items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5 transition-colors hover:bg-muted/40"
            >
              <Avatar src={user.image ?? undefined} name={user.name ?? user.email} size="sm" />
              <div className="min-w-0 flex-1 text-left">
                {user.name && (
                  <p className="truncate text-sm font-semibold leading-tight">{user.name}</p>
                )}
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <ChevronUp
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                  userMenuOpen ? "rotate-180" : "rotate-0",
                )}
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
