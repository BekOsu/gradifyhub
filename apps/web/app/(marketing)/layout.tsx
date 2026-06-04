import { MarketingFooter } from "~/components/marketing/footer";
import { MarketingNav } from "~/components/marketing/nav";
import { getOptionalUser } from "~/lib/auth/session";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOptionalUser();

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav initialUser={user ? { name: user.name ?? null, email: user.email } : null} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}