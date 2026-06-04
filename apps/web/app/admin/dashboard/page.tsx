import { Suspense } from "react";
import { StatsGrid } from "../_components/stats-grid";

export const revalidate = 3600;

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-gray-200 bg-white p-6"
        >
          <div className="h-10 w-24 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-40 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">Platform overview and key metrics</p>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Platform Metrics</h2>
        <Suspense fallback={<StatsSkeleton />}>
          <StatsGrid />
        </Suspense>
      </div>
    </div>
  );
}
