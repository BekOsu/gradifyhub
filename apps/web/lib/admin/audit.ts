import { db } from "@repo/db/client";
import { adminAuditLog } from "@repo/db/schema";

export interface LogAdminActionParams {
  adminId: string;
  adminEmail: string;
  action: string;
  targetUserId?: string;
  targetUserEmail?: string;
  details?: Record<string, unknown>;
}

/**
 * Fire-and-forget audit logging for admin actions.
 * Logs are persisted asynchronously; failures are logged but never block the action.
 */
export function logAdminAction(params: LogAdminActionParams): void {
  const {
    adminId,
    adminEmail,
    action,
    targetUserId,
    targetUserEmail,
    details,
  } = params;

  // Fire-and-forget: don't await at call site
  (async () => {
    try {
      const id = crypto.randomUUID();
      await db.insert(adminAuditLog).values({
        id,
        adminId,
        adminEmail,
        action,
        targetUserId,
        targetUserEmail,
        details: details ?? null,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error(
        "[audit] failed to log admin action",
        {
          adminId,
          adminEmail,
          action,
          targetUserId,
          error: error instanceof Error ? error.message : String(error),
        }
      );
    }
  })();
}
