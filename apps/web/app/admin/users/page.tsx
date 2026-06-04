import { db } from "@repo/db/client";
import { user, subscription } from "@repo/db/schema";
import { eq, desc } from "@repo/db/drizzle";
import { getCurrentUser } from "~/lib/auth/session";
import { UsersTable } from "./_components/users-table";

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();
  const [users, skillGroups] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        plan: subscription.plan,
        subStatus: subscription.status,
        role: user.role,
        skillGroupId: user.skillGroupId,
      })
      .from(user)
      .leftJoin(subscription, eq(subscription.userId, user.id))
      .orderBy(desc(user.createdAt))
      .limit(200),
    db.query.skillGroup.findMany(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage roles, plans, and skill groups</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {users.length} users
        </span>
      </div>

      <UsersTable initialUsers={users} skillGroups={skillGroups} currentUserRole={currentUser?.role || 'user'} />
    </div>
  );
}

