import Link from "next/link";
import { AuthCard } from "~/components/auth/card";

export const revalidate = 0;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          GradifyHub
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 pb-14">
        <AuthCard>{children}</AuthCard>
      </div>
    </div>
  );
}