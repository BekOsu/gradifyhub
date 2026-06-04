"use client";

import { useState, useTransition } from "react";
import { requestStudentReassignment } from "~/actions/tutor";
import { useToast } from "~/app/admin/_components/toast-context";

type SkillGroup = {
  id: string;
  name: string;
};

type ReassignmentModalProps = {
  studentId: string;
  currentSkillGroupId?: string;
  allSkillGroups: SkillGroup[];
};

export function ReassignmentModal({
  studentId,
  currentSkillGroupId,
  allSkillGroups,
}: ReassignmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const availableGroups = allSkillGroups.filter(
    (g) => g.id !== currentSkillGroupId
  );

  const isFormValid =
    selectedGroupId && reason.trim().length >= 10 && !isPending;

  const handleSubmit = () => {
    if (!isFormValid) return;

    startTransition(async () => {
      const result = await requestStudentReassignment(
        studentId,
        selectedGroupId,
        reason.trim()
      );

      if (result.success) {
        addToast(
          "Reassignment request submitted – admin will review",
          "success"
        );
        setIsOpen(false);
        setSelectedGroupId("");
        setReason("");
      } else {
        addToast(result.error || "Failed to submit request", "error");
      }
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Request Reassignment
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            Request Student Reassignment
          </h2>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Skill Group
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              disabled={isPending}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select a skill group...</option>
              {availableGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason for Reassignment
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isPending}
              placeholder="Explain why this student should be reassigned (min 10 characters)..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 min-h-24"
            />
            <p className="mt-1 text-xs text-gray-500">
              {reason.length}/10 characters minimum
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex gap-2 justify-end">
          <button
            onClick={() => {
              setIsOpen(false);
              setSelectedGroupId("");
              setReason("");
            }}
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {isPending ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
