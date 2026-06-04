"use client";

import { useEffect, useState, useTransition } from "react";
import { approveRoadmap, rejectRoadmap, getRoadmapDetails } from "~/actions/tutor";

type RoadmapApprovalModalProps = {
  roadmapId: string;
  isOpen: boolean;
  onClose: () => void;
  onApproved: (roadmapId: string) => void;
  onRejected: (roadmapId: string) => void;
};

type RoadmapDetails = {
  id: string;
  title: string;
  totalWeeks: number;
  phases: {
    id: string;
    name: string;
    weeks: number;
    skills: {
      id: string;
      name: string;
      estimatedHours: number;
    }[];
  }[];
};

export function RoadmapApprovalModal({
  roadmapId,
  isOpen,
  onApproved,
  onRejected,
}: RoadmapApprovalModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [roadmapDetails, setRoadmapDetails] = useState<RoadmapDetails | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !roadmapId) return;

    const loadRoadmap = async () => {
      setLoading(true);
      setError(null);
      try {
        const details = await getRoadmapDetails(roadmapId);
        if (!details) {
          setError("Roadmap not found");
          return;
        }
        setRoadmapDetails(details);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load roadmap"
        );
      } finally {
        setLoading(false);
      }
    };

    loadRoadmap();
  }, [isOpen, roadmapId]);

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approveRoadmap(roadmapId);
        onApproved(roadmapId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to approve");
      }
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    startTransition(async () => {
      try {
        await rejectRoadmap(roadmapId, rejectReason);
        onRejected(roadmapId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reject");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Roadmap Approval</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-gray-600">Loading roadmap details...</p>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : roadmapDetails ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {roadmapDetails.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Total duration: {roadmapDetails.totalWeeks} weeks
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Phases</h4>
                {roadmapDetails.phases.map((phase) => (
                  <div
                    key={phase.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {phase.name}
                        </h5>
                        <p className="text-xs text-gray-500">
                          {phase.weeks} weeks
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {phase.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-700">{skill.name}</span>
                          <span className="text-xs text-gray-500">
                            ~{skill.estimatedHours}h
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {!isRejecting ? (
                <>
                  <p className="text-sm text-gray-600">
                    Review the roadmap above. You can approve it or reject it.
                  </p>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reason for rejection
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why the roadmap is being rejected. This will be sent to the student."
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={4}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    This reason will be visible to the student
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
          <div>
            {isRejecting && (
              <button
                onClick={() => {
                  setIsRejecting(false);
                  setRejectReason("");
                  setError(null);
                }}
                className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {!isRejecting ? (
              <>
                <button
                  onClick={() => setIsRejecting(true)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {isPending ? "Approving..." : "Approve"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleReject}
                  disabled={isPending || !rejectReason.trim()}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {isPending ? "Rejecting..." : "Reject Roadmap"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
