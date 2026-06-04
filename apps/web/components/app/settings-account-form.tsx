"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUser, changePassword } from "~/lib/auth/client";

interface SettingsAccountFormProps {
  currentName: string;
  hasPasswordCredential: boolean;
}

export function SettingsAccountForm({ currentName, hasPasswordCredential }: SettingsAccountFormProps) {
  const router = useRouter();

  const [name, setName] = useState(currentName);
  const [nameStatus, setNameStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState("");
  const [showPwForm, setShowPwForm] = useState(false);

  async function handleNameSave() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === currentName) return;
    setNameStatus("saving");
    const { error } = await updateUser({ name: trimmed });
    if (error) {
      setNameStatus("error");
    } else {
      setNameStatus("saved");
      router.refresh();
      setTimeout(() => setNameStatus("idle"), 2000);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (pwNew !== pwConfirm) {
      setPwError("New passwords don't match.");
      return;
    }
    if (pwNew.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    setPwStatus("saving");
    const { error } = await changePassword({ currentPassword: pwCurrent, newPassword: pwNew });
    if (error) {
      setPwStatus("error");
      setPwError(error.message ?? "Could not update password. Check your current password.");
    } else {
      setPwStatus("saved");
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
      setShowPwForm(false);
      setTimeout(() => setPwStatus("idle"), 2500);
    }
  }

  return (
    <div className="space-y-6">
      {/* Name */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</label>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setNameStatus("idle"); }}
            onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            placeholder="Your name"
          />
          <button
            onClick={handleNameSave}
            disabled={nameStatus === "saving" || !name.trim() || name.trim() === currentName}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {nameStatus === "saving" ? "Saving…" : nameStatus === "saved" ? "Saved" : "Save"}
          </button>
        </div>
        {nameStatus === "error" && (
          <p className="mt-1.5 text-xs text-destructive">Could not update name. Try again.</p>
        )}
      </div>

      {/* Password */}
      {hasPasswordCredential && (
        <div>
          {!showPwForm ? (
            <button
              onClick={() => setShowPwForm(true)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Change password →
            </button>
          ) : (
            <form onSubmit={handlePasswordSave} className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Change password</p>
              <input
                type="password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                placeholder="Current password"
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                placeholder="New password (min. 8 characters)"
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
              {pwError && <p className="text-xs text-destructive">{pwError}</p>}
              {pwStatus === "saved" && (
                <p className="text-xs text-green-600">Password updated successfully.</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pwStatus === "saving"}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  {pwStatus === "saving" ? "Updating…" : "Update password"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPwForm(false); setPwError(""); setPwStatus("idle"); }}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
