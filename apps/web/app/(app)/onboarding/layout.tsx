import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "~/lib/auth/session";
import { Zap } from "lucide-react";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/90 px-6 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-green text-white shadow-sm">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">GradifyHub</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip setup →
        </Link>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col px-4 py-12 md:py-16 lg:py-20">
        <div className="w-full max-w-6xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
