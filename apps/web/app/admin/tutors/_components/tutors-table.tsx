"use client";

import { useState, useCallback } from "react";
import { Plus, Edit2 } from "lucide-react";
import { EditGroupModal } from "./edit-group-modal";

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

type TutorsTableProps = {
  skillGroups: SkillGroupWithStats[];
  allTutors: Tutor[];
  groupAssignments: Record<string, string[]>;
};

export function TutorsTable({
  skillGroups: initialGroups,
  allTutors,
  groupAssignments,
}: TutorsTableProps) {
  const [groups, setGroups] = useState<SkillGroupWithStats[]>(initialGroups);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleGroupUpdated = useCallback((updatedGroup: SkillGroupWithStats) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  }, []);

  const handleGroupDeleted = useCallback((groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }, []);

  const handleGroupCreated = useCallback((newGroup: SkillGroupWithStats) => {
    setGroups((prev) => [...prev, newGroup]);
    setIsCreating(false);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Skill Group
        </button>
      </div>

      {isCreating && (
        <EditGroupModal
          group={null}
          tutors={allTutors}
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onGroupCreated={handleGroupCreated}
          onGroupUpdated={handleGroupUpdated}
        />
      )}

      {editingGroupId && (
        <EditGroupModal
          group={groups.find((g) => g.id === editingGroupId) || null}
          tutors={allTutors}
          assignedTutorIds={groupAssignments[editingGroupId] || []}
          isOpen={true}
          onClose={() => setEditingGroupId(null)}
          onGroupUpdated={handleGroupUpdated}
          onGroupDeleted={handleGroupDeleted}
        />
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Skill Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Tutors Assigned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Students
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Approval Required
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {groups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                  No skill groups yet
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{group.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{group.tutorCount}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{group.studentCount}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        group.approvalRequired
                          ? "bg-yellow-50 text-yellow-800"
                          : "bg-green-50 text-green-800"
                      }`}
                    >
                      {group.approvalRequired ? "Required" : "Auto"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingGroupId(group.id)}
                        className="rounded p-1.5 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                        title="Edit skill group"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
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
