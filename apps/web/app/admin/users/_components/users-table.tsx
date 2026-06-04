'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { RowActionsMenu } from './row-actions-menu';
import { BulkActionToolbar } from './bulk-action-toolbar';

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

type UsersTableProps = {
  initialUsers: User[];
  skillGroups: SkillGroup[];
  currentUserRole: string;
};

const ITEMS_PER_PAGE = 25;

export function UsersTable({ initialUsers, skillGroups, currentUserRole }: UsersTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const skillGroupMap = new Map(skillGroups.map(g => [g.id, g.name]));

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set([...selectedIds, ...paginatedUsers.map((u) => u.id)]));
    } else {
      const newSelected = new Set(selectedIds);
      paginatedUsers.forEach((u) => newSelected.delete(u.id));
      setSelectedIds(newSelected);
    }
  }, [paginatedUsers, selectedIds]);

  const handleSelectUser = useCallback((userId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedIds(newSelected);
  }, [selectedIds]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleUserUpdated = useCallback((updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  }, []);

  const handleUserDeleted = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    const newSelected = new Set(selectedIds);
    newSelected.delete(userId);
    setSelectedIds(newSelected);
  }, [selectedIds]);

  const handleBulkComplete = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const isAllSelected = paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedIds.has(u.id));
  const isSomeSelected = paginatedUsers.some((u) => selectedIds.has(u.id)) && !isAllSelected;

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <BulkActionToolbar
          selectedCount={selectedIds.size}
          selectedIds={Array.from(selectedIds)}
          onComplete={handleBulkComplete}
          onClearSelection={handleClearSelection}
          setUsers={setUsers}
        />
      )}

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-sm text-muted-foreground">
          {searchQuery ? `Found ${filteredUsers.length} users` : `Total ${users.length} users`}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = isSomeSelected;
                    }
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
              <th className="px-4 py-3 text-left font-semibold">Skill Group</th>
              <th className="px-4 py-3 text-left font-semibold">Plan</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((u) => (
              <tr
                key={u.id}
                className={`border-b last:border-0 ${
                  selectedIds.has(u.id)
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : 'hover:bg-muted/20'
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(u.id)}
                    onChange={(e) =>
                      handleSelectUser(u.id, e.target.checked)
                    }
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.role === 'superadmin'
                        ? 'bg-purple-500/10 text-purple-600'
                        : u.role === 'admin'
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-gray-500/10 text-gray-600'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {u.skillGroupId
                    ? skillGroupMap.get(u.skillGroupId) || 'Unknown'
                    : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.plan === 'pro'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {u.plan ?? 'free'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {u.subStatus === 'banned' ? (
                    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold bg-red-500/10 text-red-600">
                      banned
                    </span>
                  ) : (
                    u.subStatus ?? '—'
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {u.createdAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3 flex items-center gap-2 justify-end">
                  <RowActionsMenu
                    user={u}
                    skillGroups={skillGroups}
                    currentUserRole={currentUserRole}
                    onUserUpdated={handleUserUpdated}
                    onUserDeleted={handleUserDeleted}
                  />
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-xs text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded-lg ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
