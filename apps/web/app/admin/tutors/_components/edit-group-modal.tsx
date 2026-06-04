"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "~/app/admin/users/_components/confirm-modal";
import {
  createSkillGroup,
  updateSkillGroupName,
  setApprovalRequired,
  deleteSkillGroup,
  assignTutorToGroup,
  removeTutorFromGroup,
} from "~/actions/tutor";

type SkillGroupWithStats = {
  id: string;
  name: string;
  approvalRequired: boolean;
  createdAt: Date;
  tutorCount: number;
  studentCount: number;
};

type Tutor = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type EditGroupModalProps = {
  group: SkillGroupWithStats | null;
  tutors: Tutor[];
  assignedTutorIds?: string[];
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: (group: SkillGroupWithStats) => void;
  onGroupUpdated?: (group: SkillGroupWithStats) => void;
  onGroupDeleted?: (groupId: string) => void;
};

export function EditGroupModal({
  group,
  tutors,
  assignedTutorIds: initialAssignedIds = [],
  isOpen,
  onClose,
  onGroupCreated,
  onGroupUpdated,
  onGroupDeleted,
}: EditGroupModalProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(group?.name ?? "");
  const [approvalRequired, setApprovalRequiredState] = useState(
    group?.approvalRequired ?? true
  );
  const [assignedTutorIds, setAssignedTutorIds] = useState<Set<string>>(
    new Set(initialAssignedIds)
  );
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    startTransition(async () => {
      setError(null);
      try {
        if (!group) {
          const result = await createSkillGroup(name);
          if (onGroupCreated) {
            onGroupCreated({
              id: result.id,
              name,
              approvalRequired,
              createdAt: new Date(),
              tutorCount: 0,
              studentCount: 0,
            });
          }
        } else {
          if (name !== group.name) {
            await updateSkillGroupName(group.id, name);
          }
          if (approvalRequired !== group.approvalRequired) {
            await setApprovalRequired(group.id, approvalRequired);
          }

          const previousAssigned = new Set(initialAssignedIds);

          for (const tutorId of assignedTutorIds) {
            if (!previousAssigned.has(tutorId)) {
              await assignTutorToGroup(tutorId, group.id);
            }
          }

          for (const tutorId of previousAssigned) {
            if (!assignedTutorIds.has(tutorId)) {
              await removeTutorFromGroup(tutorId, group.id);
            }
          }

          if (onGroupUpdated) {
            onGroupUpdated({
              ...group,
              name,
              approvalRequired,
            });
          }
        }
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save changes");
      }
    });
  };

  const handleDeleteConfirmed = () => {
    if (!group) return;

    startTransition(async () => {
      setError(null);
      try {
        await deleteSkillGroup(group.id);
        if (onGroupDeleted) {
          onGroupDeleted(group.id);
        }
        setShowDeleteConfirm(false);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete group");
        setShowDeleteConfirm(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            {group ? "Edit Skill Group" : "Create Skill Group"}
          </h2>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Backend, Frontend, AI"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={approvalRequired}
                onChange={(e) => setApprovalRequiredState(e.target.checked)}
                className="rounded border border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Roadmaps require tutor approval
              </span>
            </label>
            <p className="text-xs text-gray-500">
              {approvalRequired
                ? "Roadmaps must be manually approved by a tutor before students see them"
                : "Roadmaps are automatically approved when created"}
            </p>
          </div>

          {group && tutors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assign Tutors
              </label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {tutors.map((tutor) => (
                  <label key={tutor.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignedTutorIds.has(tutor.id)}
                      onChange={(e) => {
                        const newSet = new Set(assignedTutorIds);
                        if (e.target.checked) {
                          newSet.add(tutor.id);
                        } else {
                          newSet.delete(tutor.id);
                        }
                        setAssignedTutorIds(newSet);
                      }}
                      className="rounded border border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{tutor.name}</p>
                      <p className="text-xs text-gray-500">{tutor.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
          <div>
            {group && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending}
                className="rounded p-1.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50 flex items-center gap-1.5"
                title="Delete skill group"
              >
                <Trash2 className="h-4 w-4" />
                {isPending && <span className="text-xs">Deleting...</span>}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || !name.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Skill Group"
        description={`Are you sure you want to delete "${group?.name}"? This cannot be undone.`}
        confirmText="Delete Group"
        isDangerous
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isPending}
      />
    </div>
  );
}
