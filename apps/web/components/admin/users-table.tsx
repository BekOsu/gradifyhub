"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Zap,
  User,
} from "lucide-react";
import { UserRowActions } from "./user-row-actions";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  plan: string | null;
  subStatus: string | null;
  createdAt: Date;
};

function PlanBadge({ plan }: { plan: string | null }) {
  if (plan === "pro")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
        <Zap className="h-3 w-3" />
        Pro
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
      <User className="h-3 w-3" />
      Free
    </span>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === "banned")
    return (
      <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
        Banned
      </span>
    );
  if (status === "active")
    return (
      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
        Active
      </span>
    );
  return <span className="text-xs text-gray-400">—</span>;
}

export function AdminUsersTable({ users }: { users: UserRow[] }) {
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.plan ?? "free").toLowerCase().includes(q),
    );
  }, [users, query]);

  const handleActionComplete = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, plan…"
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-green/50 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                Joined
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                  No users match.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr
                  key={`${u.id}-${refreshKey}`}
                  className="border-b border-gray-200 transition-colors last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{u.name ?? "—"}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <PlanBadge plan={u.plan} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.subStatus} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {u.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <UserRowActions
                      userId={u.id}
                      currentPlan={(u.plan as "free" | "pro") ?? "free"}
                      currentStatus={u.subStatus}
                      onActionComplete={handleActionComplete}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
