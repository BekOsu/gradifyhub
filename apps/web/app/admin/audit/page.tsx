import { db } from "@repo/db/client";
import { adminAuditLog } from "@repo/db/schema";
import { desc, eq } from "@repo/db/drizzle";
import { requireAdmin, ROLES } from "~/lib/auth/permissions";

const ACTION_STYLE: Record<string, string> = {
  delete_user:   "bg-destructive/10 text-destructive",
  change_role:   "bg-amber-500/10 text-amber-600",
  create:        "bg-green-500/10 text-green-600",
  update:        "bg-blue-500/10 text-blue-600",
};

function actionStyle(action: string): string {
  for (const [key, cls] of Object.entries(ACTION_STYLE)) {
    if (action.toLowerCase().includes(key)) return cls;
  }
  return "bg-muted text-muted-foreground";
}

export default async function AdminAuditPage() {
  const admin = await requireAdmin();

  // Build query: superadmin sees all, admin sees only their own
  const query = db
    .select({
      id: adminAuditLog.id,
      adminEmail: adminAuditLog.adminEmail,
      action: adminAuditLog.action,
      targetUserId: adminAuditLog.targetUserId,
      targetUserEmail: adminAuditLog.targetUserEmail,
      details: adminAuditLog.details,
      createdAt: adminAuditLog.createdAt,
    })
    .from(adminAuditLog);

  // If regular admin, filter to only their actions
  if (admin.role !== ROLES.SUPERADMIN) {
    query.where(eq(adminAuditLog.adminId, admin.id));
  }

  const logs = await query
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Admin actions recorded in this workspace</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {logs.length} entries
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Admin</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
              <th className="px-4 py-3 text-left font-semibold">Target User</th>
              <th className="px-4 py-3 text-left font-semibold">Details</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="text-muted-foreground">{log.adminEmail}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${actionStyle(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {log.targetUserEmail ? (
                    <p>{log.targetUserEmail}</p>
                  ) : log.targetUserId ? (
                    <p className="font-mono text-xs">{log.targetUserId}</p>
                  ) : (
                    <p>—</p>
                  )}
                </td>
                <td className="px-4 py-3 max-w-xs">
                  {log.details ? (
                    <details className="group">
                      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground list-none">
                        View details ↓
                      </summary>
                      <pre className="mt-1 text-xs text-muted-foreground overflow-auto max-h-32 bg-muted/30 p-2 rounded whitespace-pre-wrap break-all">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  ) : (
                    <p className="text-muted-foreground text-xs">—</p>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {log.createdAt.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No audit log entries found</p>
        </div>
      )}
    </div>
  );
}
