"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminOverridePlan, adminBanUser, adminUnbanUser, adminDeleteUser } from "~/actions/admin";
import { ConfirmModal } from "~/app/admin/users/_components/confirm-modal";

interface AdminUserActionsProps {
  userId: string;
  currentPlan: "free" | "pro";
  currentStatus: string;
  userEmail?: string;
  userName?: string;
}

export function AdminUserActions({ userId, currentPlan, currentStatus, userEmail = "", userName = "User" }: AdminUserActionsProps) {
  const router = useRouter();
  const [plan, setPlan] = useState(currentPlan);
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [modalState, setModalState] = useState<{ type: "ban" | "unban" | "delete" | null; isOpen: boolean }>({ type: null, isOpen: false });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  function handleOverride(newPlan: "free" | "pro") {
    startTransition(async () => {
      try {
        await adminOverridePlan(userId, newPlan);
        setPlan(newPlan);
        showToast(`Plan updated to ${newPlan}`, "success");
      } catch {
        showToast("Failed to update plan", "error");
      }
    });
  }

  function handleBan() {
    setModalState({ type: "ban", isOpen: true });
  }

  function confirmBan() {
    startTransition(async () => {
      try {
        await adminBanUser(userId);
        setStatus("banned");
        setModalState({ type: null, isOpen: false });
        showToast("User banned", "success");
      } catch {
        showToast("Failed to ban user", "error");
      }
    });
  }

  function handleUnban() {
    setModalState({ type: "unban", isOpen: true });
  }

  function confirmUnban() {
    startTransition(async () => {
      try {
        await adminUnbanUser(userId);
        setPlan("free");
        setStatus("active");
        setModalState({ type: null, isOpen: false });
        showToast("User unbanned. Plan reset to free.", "success");
      } catch {
        showToast("Failed to unban user", "error");
      }
    });
  }

  function handleDelete() {
    setModalState({ type: "delete", isOpen: true });
  }

  function confirmDelete() {
    startTransition(async () => {
      try {
        await adminDeleteUser(userId);
        setModalState({ type: null, isOpen: false });
        showToast("User deleted", "success");
        setTimeout(() => router.push("/admin/users"), 1000);
      } catch {
        showToast("Failed to delete user", "error");
      }
    });
  }

  return (
    <>
      <div className="space-y-6 rounded-xl border p-6">
        <h2 className="font-semibold">Admin actions</h2>

        <div>
          <p className="mb-2 text-sm font-medium">Override plan</p>
          <div className="flex gap-2">
            {(["free", "pro"] as const).map((p) => (
              <button
                key={p}
                disabled={isPending || plan === p || status === "banned"}
                onClick={() => handleOverride(p)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  plan === p
                    ? "bg-primary text-primary-foreground"
                    : "border hover:bg-muted"
                } disabled:opacity-50`}
              >
                {p}
              </button>
            ))}
          </div>
          {status === "banned" && (
            <p className="mt-2 text-xs text-muted-foreground">Unban the user before changing their plan.</p>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-destructive">Danger zone</p>
          {status === "banned" ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-destructive">This user is banned.</span>
              <button
                disabled={isPending}
                onClick={handleUnban}
                className="rounded-full border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
              >
                Unban
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                disabled={isPending}
                onClick={handleBan}
                className="rounded-full border border-destructive px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                Ban user
              </button>
              <button
                disabled={isPending}
                onClick={handleDelete}
                className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Delete account
              </button>
            </div>
          )}
        </div>

        {toastMessage && (
          <p className={`text-sm font-medium ${toastMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
            {toastMessage.text}
          </p>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === "ban"}
        title="Ban User"
        description={`Are you sure you want to ban ${userName}?\n\nEmail: ${userEmail}\n\nThis will immediately revoke their access to all features. They will need to contact support to be unbanned.`}
        confirmText="Ban User"
        isDangerous
        onConfirm={confirmBan}
        onCancel={() => setModalState({ type: null, isOpen: false })}
        isLoading={isPending}
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === "unban"}
        title="Unban User"
        description={`Are you sure you want to unban ${userName}?\n\nEmail: ${userEmail}\n\nTheir access will be restored and their plan will be reset to free.`}
        confirmText="Unban User"
        onConfirm={confirmUnban}
        onCancel={() => setModalState({ type: null, isOpen: false })}
        isLoading={isPending}
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === "delete"}
        title="Permanently Delete User"
        description={
          <div className="space-y-3">
            <p className="font-semibold text-red-700">This action cannot be undone.</p>
            <div>
              <p className="text-sm font-medium text-slate-900">User Details:</p>
              <p className="text-sm text-slate-600">{userName}</p>
              <p className="text-sm text-slate-600">{userEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 mb-2">This will permanently delete:</p>
              <ul className="text-sm text-slate-600 space-y-1 ml-4">
                <li>• All user data and profile information</li>
                <li>• Assessment attempts and progress</li>
                <li>• Subscriptions and billing records</li>
                <li>• Interview prep sessions</li>
                <li>• All associated data</li>
              </ul>
            </div>
          </div>
        }
        confirmText="Delete User"
        isDangerous
        onConfirm={confirmDelete}
        onCancel={() => setModalState({ type: null, isOpen: false })}
        isLoading={isPending}
      />
    </>
  );
}

