"use client";

import { useState, useTransition } from "react";
import {
  MoreVertical,
  Check,
  Ban,
  Trash2,
} from "lucide-react";
import { adminOverridePlan, adminBanUser, adminUnbanUser, adminDeleteUser } from "~/actions/admin";
import { cn } from "~/lib/utils";

interface UserRowActionsProps {
  userId: string;
  currentPlan: "free" | "pro";
  currentStatus: string | null;
  onActionComplete?: () => void;
}

export function UserRowActions({
  userId,
  currentPlan,
  currentStatus,
  onActionComplete,
}: UserRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handlePlanChange(newPlan: "free" | "pro") {
    if (newPlan === currentPlan) return;

    startTransition(async () => {
      await adminOverridePlan(userId, newPlan);
      setIsOpen(false);
      onActionComplete?.();
    });
  }

  function handleBan() {
    if (!confirm("Ban this user? They will lose access immediately.")) return;
    startTransition(async () => {
      await adminBanUser(userId);
      setIsOpen(false);
      onActionComplete?.();
    });
  }

  function handleUnban() {
    if (!confirm("Unban this user? Their plan will be reset to free.")) return;
    startTransition(async () => {
      await adminUnbanUser(userId);
      setIsOpen(false);
      onActionComplete?.();
    });
  }

  function handleDelete() {
    if (!confirm("Permanently delete this user and ALL their data? This cannot be undone.")) return;
    startTransition(async () => {
      await adminDeleteUser(userId);
      setIsOpen(false);
      onActionComplete?.();
    });
  }

  const isBanned = currentStatus === "banned";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
        title="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 top-full z-50 mt-2 min-w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
            {/* Plan section */}
            {!isBanned && (
              <>
                <div className="px-2 py-1.5">
                  <p className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Plan
                  </p>
                  {(["free", "pro"] as const).map((plan) => (
                    <button
                      key={plan}
                      onClick={() => handlePlanChange(plan)}
                      disabled={isPending || currentPlan === plan}
                      className={cn(
                        "w-full rounded px-2 py-2 text-left text-sm font-medium transition",
                        currentPlan === plan
                          ? "bg-green-50 text-green-700"
                          : "text-gray-700 hover:bg-gray-100 disabled:opacity-50",
                      )}
                    >
                      {currentPlan === plan && (
                        <Check className="mr-2 inline h-3.5 w-3.5" />
                      )}
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-200" />
              </>
            )}

            {/* Actions section */}
            <div className="px-2 py-1.5">
              {isBanned ? (
                <button
                  onClick={handleUnban}
                  disabled={isPending}
                  className="w-full rounded px-2 py-2 text-left text-sm font-medium text-green-600 transition hover:bg-green-50 disabled:opacity-50"
                >
                  <Check className="mr-2 inline h-3.5 w-3.5" />
                  Unban User
                </button>
              ) : (
                <button
                  onClick={handleBan}
                  disabled={isPending}
                  className="w-full rounded px-2 py-2 text-left text-sm font-medium text-amber-600 transition hover:bg-amber-50 disabled:opacity-50"
                >
                  <Ban className="mr-2 inline h-3.5 w-3.5" />
                  Ban User
                </button>
              )}

              <button
                onClick={handleDelete}
                disabled={isPending}
                className="w-full rounded px-2 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="mr-2 inline h-3.5 w-3.5" />
                Delete Account
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
