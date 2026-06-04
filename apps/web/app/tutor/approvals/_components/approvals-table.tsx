"use client";

import { useState } from "react";
import { RoadmapApprovalModal } from "./roadmap-approval-modal";

type RoadmapForApproval = {
  id: string;
  title: string;
  studentName: string;
  studentEmail: string;
  skillGroup: string;
  createdAt: Date;
  canApprove: boolean;
};

type ApprovalsTableProps = {
  roadmaps: RoadmapForApproval[];
};

export function ApprovalsTable({ roadmaps: initialRoadmaps }: ApprovalsTableProps) {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [roadmaps, setRoadmaps] = useState<RoadmapForApproval[]>(initialRoadmaps);

  const selectedRoadmap = selectedRoadmapId
    ? roadmaps.find((r) => r.id === selectedRoadmapId)
    : null;

  const handleRoadmapApproved = (roadmapId: string) => {
    setRoadmaps((prev) => prev.filter((r) => r.id !== roadmapId));
    setSelectedRoadmapId(null);
  };

  const handleRoadmapRejected = (roadmapId: string) => {
    setRoadmaps((prev) => prev.filter((r) => r.id !== roadmapId));
    setSelectedRoadmapId(null);
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Roadmap
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Skill Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Submitted
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roadmaps.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  All pending roadmaps have been approved or rejected
                </td>
              </tr>
            ) : (
              roadmaps.map((rm) => (
                <tr
                  key={rm.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedRoadmapId(rm.id)}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{rm.studentName}</p>
                      <p className="text-xs text-gray-500">{rm.studentEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{rm.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{rm.skillGroup}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {rm.createdAt.toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoadmapId(rm.id);
                      }}
                      className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                      Review →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedRoadmap && (
        <RoadmapApprovalModal
          roadmapId={selectedRoadmap.id}
          isOpen={!!selectedRoadmapId}
          onClose={() => setSelectedRoadmapId(null)}
          onApproved={handleRoadmapApproved}
          onRejected={handleRoadmapRejected}
        />
      )}
    </>
  );
}
