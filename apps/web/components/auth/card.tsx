export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
      {children}
    </div>
  );
}