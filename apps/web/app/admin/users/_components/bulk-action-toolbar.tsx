'use client';

import { useState } from 'react';
import { ConfirmModal } from './confirm-modal';
import { useToast } from '../../_components/toast-context';
import {
  adminBulkDelete,
  adminBulkBan,
  adminBulkUnban,
  adminBulkSetPlan,
  adminBulkSetStatus,
} from '~/actions/admin';

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  plan: string | null;
  subStatus: string | null;
  role: string;
  skillGroupId: string | null;
};

type BulkActionToolbarProps = {
  selectedCount: number;
  selectedIds: string[];
  onComplete: () => void;
  onClearSelection: () => void;
  setUsers: (updater: (users: User[]) => User[]) => void;
};

export function BulkActionToolbar({
  selectedCount,
  selectedIds,
  onComplete,
  onClearSelection,
  setUsers,
}: BulkActionToolbarProps) {
  const { addToast } = useToast();
  const [showPlanSelect, setShowPlanSelect] = useState(false);
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState<{
    type: 'ban' | 'unban' | 'delete' | 'plan' | 'status' | null;
    isOpen: boolean;
    selectedPlan?: string;
    selectedStatus?: string;
  }>({ type: null, isOpen: false });

  const handleBulkDelete = () => {
    setModalState({ type: 'delete', isOpen: true });
  };

  const handleBulkBan = () => {
    setModalState({ type: 'ban', isOpen: true });
  };

  const handleBulkUnban = () => {
    setModalState({ type: 'unban', isOpen: true });
  };

  const handleBulkChangePlan = (plan: string) => {
    setShowPlanSelect(false);
    setModalState({ type: 'plan', isOpen: true, selectedPlan: plan });
  };

  const handleBulkChangeStatus = (status: string) => {
    setShowStatusSelect(false);
    setModalState({ type: 'status', isOpen: true, selectedStatus: status });
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const result = await adminBulkDelete(selectedIds);
      if (result.success) {
        setUsers((prev: User[]) =>
          prev.filter((u) => !selectedIds.includes(u.id))
        );
        addToast(`${selectedCount} user(s) deleted`, 'success');
        onComplete();
      } else {
        addToast(result.error || 'Failed to delete users', 'error');
      }
    } finally {
      setLoading(false);
      setModalState({ type: null, isOpen: false });
    }
  };

  const confirmBan = async () => {
    setLoading(true);
    try {
      const result = await adminBulkBan(selectedIds);
      if (result.success) {
        setUsers((prev: User[]) =>
          prev.map((u) =>
            selectedIds.includes(u.id)
              ? { ...u, subStatus: 'banned' }
              : u
          )
        );
        addToast(`${selectedCount} user(s) banned`, 'success');
        onComplete();
      } else {
        addToast(result.error || 'Failed to ban users', 'error');
      }
    } finally {
      setLoading(false);
      setModalState({ type: null, isOpen: false });
    }
  };

  const confirmUnban = async () => {
    setLoading(true);
    try {
      const result = await adminBulkUnban(selectedIds);
      if (result.success) {
        setUsers((prev: User[]) =>
          prev.map((u) =>
            selectedIds.includes(u.id)
              ? { ...u, subStatus: 'active' }
              : u
          )
        );
        addToast(`${selectedCount} user(s) unbanned`, 'success');
        onComplete();
      } else {
        addToast(result.error || 'Failed to unban users', 'error');
      }
    } finally {
      setLoading(false);
      setModalState({ type: null, isOpen: false });
    }
  };

  const confirmPlan = async () => {
    if (!modalState.selectedPlan) return;
    setLoading(true);
    try {
      const result = await adminBulkSetPlan(
        selectedIds,
        modalState.selectedPlan as 'free' | 'pro'
      );
      if (result.success) {
        setUsers((prev: User[]) =>
          prev.map((u) =>
            selectedIds.includes(u.id)
              ? { ...u, plan: modalState.selectedPlan || null }
              : u
          )
        );
        addToast(`Plan changed to ${modalState.selectedPlan} for ${selectedCount} user(s)`, 'success');
        onComplete();
      } else {
        addToast(result.error || 'Failed to update plans', 'error');
      }
    } finally {
      setLoading(false);
      setModalState({ type: null, isOpen: false });
    }
  };

  const confirmStatus = async () => {
    if (!modalState.selectedStatus) return;
    setLoading(true);
    try {
      const result = await adminBulkSetStatus(selectedIds, modalState.selectedStatus);
      if (result.success) {
        setUsers((prev: User[]) =>
          prev.map((u) =>
            selectedIds.includes(u.id)
              ? { ...u, subStatus: modalState.selectedStatus || null }
              : u
          )
        );
        addToast(`Status changed to ${modalState.selectedStatus} for ${selectedCount} user(s)`, 'success');
        onComplete();
      } else {
        addToast(result.error || 'Failed to update status', 'error');
      }
    } finally {
      setLoading(false);
      setModalState({ type: null, isOpen: false });
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="flex-1 text-sm font-medium text-blue-900">
          {selectedCount} selected
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkBan}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-full border hover:bg-muted disabled:opacity-50"
          >
            Ban
          </button>

          <button
            onClick={handleBulkUnban}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-full border hover:bg-muted disabled:opacity-50"
          >
            Unban
          </button>

          <div className="relative">
            <button
              onClick={() => setShowPlanSelect(!showPlanSelect)}
              disabled={loading}
              className="px-3 py-1.5 text-sm rounded-full border hover:bg-muted disabled:opacity-50"
            >
              Change Plan
            </button>
            {showPlanSelect && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
                {(['free', 'pro'] as const).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => handleBulkChangePlan(plan)}
                    disabled={loading}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted disabled:opacity-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </button>
                ))}
              </div>
            )}
            {showPlanSelect && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowPlanSelect(false)}
              />
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowStatusSelect(!showStatusSelect)}
              disabled={loading}
              className="px-3 py-1.5 text-sm rounded-full border hover:bg-muted disabled:opacity-50"
            >
              Change Status
            </button>
            {showStatusSelect && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
                {['active', 'paused', 'cancelled', 'expired'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleBulkChangeStatus(status)}
                    disabled={loading}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted disabled:opacity-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            )}
            {showStatusSelect && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowStatusSelect(false)}
              />
            )}
          </div>

          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-full border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>

          <button
            onClick={onClearSelection}
            disabled={loading}
            className="px-2 py-1.5 hover:bg-muted rounded disabled:opacity-50"
            title="Clear selection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'ban'}
        title="Ban Users"
        description={`Are you sure you want to ban ${selectedCount} user(s)?\n\nThis will immediately revoke access for all selected users. They will need to contact support to be unbanned.`}
        confirmText="Ban Users"
        isDangerous
        onConfirm={confirmBan}
        onCancel={() => setModalState({ type: null, isOpen: false })}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'unban'}
        title="Unban Users"
        description={`Are you sure you want to unban ${selectedCount} user(s)?\n\nThis will restore access and reset all plans to free.`}
        confirmText="Unban Users"
        onConfirm={confirmUnban}
        onCancel={() => setModalState({ type: null, isOpen: false })}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'plan'}
        title="Change Plan"
        description={`Change plan to ${modalState.selectedPlan} for ${selectedCount} user(s)?\n\nAll selected users will be assigned the ${modalState.selectedPlan} plan.`}
        confirmText={`Change to ${modalState.selectedPlan}`}
        onConfirm={confirmPlan}
        onCancel={() => setModalState({ type: null, isOpen: false })}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'status'}
        title="Change Status"
        description={`Change status to ${modalState.selectedStatus} for ${selectedCount} user(s)?\n\nAll selected users will have their status changed to ${modalState.selectedStatus}.`}
        confirmText={`Change to ${modalState.selectedStatus}`}
        onConfirm={confirmStatus}
        onCancel={() => setModalState({ type: null, isOpen: false })}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'delete'}
        title="Permanently Delete Users"
        description={
          <div className="space-y-3">
            <p className="font-semibold text-red-700">This action cannot be undone.</p>
            <p className="text-sm text-slate-600">
              You are about to permanently delete <span className="font-bold">{selectedCount} user(s)</span> and all their associated data.
            </p>
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
        confirmText="Delete All Users"
        isDangerous
        onConfirm={confirmDelete}
        onCancel={() => setModalState({ type: null, isOpen: false })}
        isLoading={loading}
      />
    </>
  );
}
