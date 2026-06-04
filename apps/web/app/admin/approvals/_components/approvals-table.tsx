'use client';

import { useState } from 'react';
import { useToast } from '../../_components/toast-context';
import { adminApproveSkillGroupRequest, adminRejectSkillGroupRequest } from '~/actions/admin';

type ApprovalRequest = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  skillGroupId: string;
  skillGroupName: string | null;
  status: string;
  requestedAt: Date;
  requestedBy: string;
  requesterName: string | null;
  requesterRole: string | null;
};

type ApprovalsTableProps = {
  initialRequests: ApprovalRequest[];
};

export function ApprovalsTable({ initialRequests }: ApprovalsTableProps) {
  const { addToast } = useToast();
  const [requests, setRequests] = useState(initialRequests);
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const handleApprove = async (requestId: string) => {
    setLoading(requestId);
    try {
      const result = await adminApproveSkillGroupRequest(requestId);
      if (result.success) {
        addToast('Approval request approved', 'success');
        setRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status: 'approved' } : r));
      } else {
        addToast(result.error || 'Failed to approve request', 'error');
      }
    } catch {
      addToast('Failed to approve request', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleRejectSubmit = async (requestId: string) => {
    setLoading(requestId);
    try {
      const result = await adminRejectSkillGroupRequest(requestId, rejectReason);
      if (result.success) {
        addToast('Request rejected', 'success');
        setRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status: 'rejected' } : r));
        setShowRejectModal(null);
        setRejectReason('');
      } else {
        addToast(result.error || 'Failed to reject request', 'error');
      }
    } catch {
      addToast('Failed to reject request', 'error');
    } finally {
      setLoading(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-muted-foreground">No approval requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">User</th>
              <th className="px-4 py-3 text-left font-semibold">Requested Skill Group</th>
              <th className="px-4 py-3 text-left font-semibold">Requested By</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Requested</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{req.userName}</p>
                    <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600">
                    {req.skillGroupName || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{req.requesterName || 'System'}</p>
                    {req.requesterRole && (
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          req.requesterRole === 'tutor'
                            ? 'bg-blue-500/10 text-blue-600'
                            : req.requesterRole === 'admin'
                              ? 'bg-purple-500/10 text-purple-600'
                              : 'bg-gray-500/10 text-gray-600'
                        }`}
                      >
                        {req.requesterRole}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      req.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : req.status === 'approved'
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-red-500/10 text-red-600'
                    }`}
                  >
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(req.requestedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {req.status === 'pending' && (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={loading === req.id}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setShowRejectModal(req.id)}
                        disabled={loading === req.id}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-96 space-y-4">
            <h3 className="text-lg font-semibold">Reject Request</h3>
            <p className="text-sm text-muted-foreground">
              Provide a reason for rejecting this skill group request.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full border rounded-lg p-2 text-sm"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-sm border rounded hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectSubmit(showRejectModal)}
                disabled={loading === showRejectModal || !rejectReason.trim()}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
