'use client';

import { useState } from 'react';
import { ConfirmModal } from './confirm-modal';
import { useToast } from '../../_components/toast-context';
import { adminBanUser, adminUnbanUser, adminDeleteUser, adminOverridePlan, adminBulkSetStatus, adminChangeRole, adminChangeSkillGroup } from '~/actions/admin';

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

type SkillGroup = {
  id: string;
  name: string;
};

type RowActionsMenuProps = {
  user: User;
  skillGroups: SkillGroup[];
  currentUserRole: string;
  onUserUpdated: (user: User) => void;
  onUserDeleted: (userId: string) => void;
};

export function RowActionsMenu({
  user,
  skillGroups,
  currentUserRole,
  onUserUpdated,
  onUserDeleted,
}: RowActionsMenuProps) {
  const { addToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSkillGroupMenu, setShowSkillGroupMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState<{
    type: 'ban' | 'unban' | 'delete' | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });

  const isBanned = user.subStatus === 'banned';

  const handleBan = () => {
    setShowMenu(false);
    setModalState({ type: 'ban', isOpen: true });
  };

  const handleUnban = () => {
    setShowMenu(false);
    setModalState({ type: 'unban', isOpen: true });
  };

  const handleDelete = () => {
    setShowMenu(false);
    setModalState({ type: 'delete', isOpen: true });
  };

  const handleChangePlan = async (plan: string) => {
    setLoading(true);
    try {
      await adminOverridePlan(user.id, plan as 'free' | 'pro');
      onUserUpdated({
        ...user,
        plan,
      });
      addToast(`Plan changed to ${plan}`, 'success');
      setShowPlanMenu(false);
      setShowMenu(false);
    } catch {
      addToast('Failed to change plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (status: string) => {
    setLoading(true);
    try {
      await adminBulkSetStatus([user.id], status);
      onUserUpdated({
        ...user,
        subStatus: status,
      });
      addToast(`Status changed to ${status}`, 'success');
      setShowStatusMenu(false);
      setShowMenu(false);
    } catch {
      addToast('Failed to change status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (newRole: string) => {
    setLoading(true);
    try {
      const result = await adminChangeRole(user.id, newRole);
      if (result.success) {
        onUserUpdated({
          ...user,
          role: newRole,
        });
        addToast(`Role changed to ${newRole}`, 'success');
        setShowRoleMenu(false);
        setShowMenu(false);
      } else {
        addToast(result.error || 'Failed to change role', 'error');
      }
    } catch {
      addToast('Failed to change role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSkillGroup = async (skillGroupId: string | null) => {
    setLoading(true);
    try {
      const result = await adminChangeSkillGroup(user.id, skillGroupId);
      if (result.success) {
        const skillGroupName = skillGroupId
          ? skillGroups.find((g) => g.id === skillGroupId)?.name || 'Unknown'
          : 'None';

        if (result.requiresApproval) {
          addToast(`Approval request created - ${skillGroupName} is at capacity`, 'success');
        } else {
          onUserUpdated({
            ...user,
            skillGroupId,
          });
          addToast(`Skill group changed to ${skillGroupName}`, 'success');
        }
        setShowSkillGroupMenu(false);
        setShowMenu(false);
      } else {
        addToast(result.error || 'Failed to change skill group', 'error');
      }
    } catch {
      addToast('Failed to change skill group', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmBan = async () => {
    setLoading(true);
    try {
      await adminBanUser(user.id);
      onUserUpdated({
        ...user,
        subStatus: 'banned',
      });
      addToast(`${user.name} has been banned`, 'success');
      setModalState({ type: null, isOpen: false });
    } catch {
      addToast('Failed to ban user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmUnban = async () => {
    setLoading(true);
    try {
      await adminUnbanUser(user.id);
      onUserUpdated({
        ...user,
        plan: 'free',
        subStatus: 'active',
      });
      addToast(`${user.name} has been unbanned`, 'success');
      setModalState({ type: null, isOpen: false });
    } catch {
      addToast('Failed to unban user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await adminDeleteUser(user.id);
      onUserDeleted(user.id);
      addToast(`${user.name} has been deleted`, 'success');
      setModalState({ type: null, isOpen: false });
    } catch {
      addToast('Failed to delete user', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={loading}
          className="p-1 hover:bg-muted rounded disabled:opacity-50"
          title="More actions"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
            {/* Ban/Unban */}
            <button
              onClick={isBanned ? handleUnban : handleBan}
              disabled={loading}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-muted disabled:opacity-50 first:rounded-t-lg"
            >
              {isBanned ? 'Unban User' : 'Ban User'}
            </button>

            {/* Change Plan Submenu */}
            <div className="border-t">
              <button
                onClick={() => setShowPlanMenu(!showPlanMenu)}
                disabled={loading}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-muted disabled:opacity-50 flex items-center justify-between"
              >
                Change Plan
                <span className="text-xs">›</span>
              </button>
              {showPlanMenu && (
                <div className="pl-4 bg-muted/50">
                  {(['free', 'pro'] as const).map((plan) => (
                    <button
                      key={plan}
                      onClick={() => handleChangePlan(plan)}
                      disabled={loading}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
                    >
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Change Status Submenu */}
            <div className="border-t">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                disabled={loading}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-muted disabled:opacity-50 flex items-center justify-between"
              >
                Change Status
                <span className="text-xs">›</span>
              </button>
              {showStatusMenu && (
                <div className="pl-4 bg-muted/50">
                  {['active', 'paused', 'cancelled', 'expired'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleChangeStatus(status)}
                      disabled={loading}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Change Skill Group */}
            <div className="border-t">
              <button
                onClick={() => setShowSkillGroupMenu(!showSkillGroupMenu)}
                disabled={loading}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-muted disabled:opacity-50 flex items-center justify-between"
              >
                Change Skill Group
                <span className="text-xs">›</span>
              </button>
              {showSkillGroupMenu && (
                <div className="pl-4 bg-muted/50">
                  <button
                    key="none"
                    onClick={() => handleChangeSkillGroup(null)}
                    disabled={loading}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
                  >
                    <span className={!user.skillGroupId ? 'font-semibold' : ''}>None</span>
                    {!user.skillGroupId && ' ✓'}
                  </button>
                  {skillGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => handleChangeSkillGroup(group.id)}
                      disabled={loading}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
                    >
                      <span className={user.skillGroupId === group.id ? 'font-semibold' : ''}>{group.name}</span>
                      {user.skillGroupId === group.id && ' ✓'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Change Role - Superadmin only */}
            {currentUserRole === 'superadmin' && (
              <div className="border-t">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  disabled={loading}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-muted disabled:opacity-50 flex items-center justify-between"
                >
                  Change Role
                  <span className="text-xs">›</span>
                </button>
                {showRoleMenu && (
                  <div className="pl-4 bg-muted/50">
                    {['user', 'admin', 'tutor', 'superadmin'].map((role) => (
                      <button
                        key={role}
                        onClick={() => handleChangeRole(role)}
                        disabled={loading}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
                      >
                        <span className={user.role === role ? 'font-semibold' : ''}>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                        {user.role === role && ' ✓'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Delete - Superadmin only */}
            {currentUserRole === 'superadmin' && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 border-t last:rounded-b-lg"
              >
                Delete User
              </button>
            )}
          </div>
        )}

        {showMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'ban'}
        title="Ban User"
        description={`Are you sure you want to ban ${user.name}?\n\nEmail: ${user.email}\n\nThis will immediately revoke their access to all features. They will need to contact support to be unbanned.`}
        confirmText="Ban User"
        isDangerous
        onConfirm={confirmBan}
        onCancel={() => setModalState({ type: null, isOpen: false })}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'unban'}
        title="Unban User"
        description={`Are you sure you want to unban ${user.name}?\n\nEmail: ${user.email}\n\nTheir access will be restored and their plan will be reset to free.`}
        confirmText="Unban User"
        onConfirm={confirmUnban}
        onCancel={() => setModalState({ type: null, isOpen: false })}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'delete'}
        title="Permanently Delete User"
        description={
          <div className="space-y-3">
            <p className="font-semibold text-red-700">This action cannot be undone.</p>
            <div>
              <p className="text-sm font-medium text-slate-900">User Details:</p>
              <p className="text-sm text-slate-600">{user.name}</p>
              <p className="text-sm text-slate-600">{user.email}</p>
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
        isLoading={loading}
      />
    </>
  );
}
