import { requireAuth } from "./session";

export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  TUTOR: "tutor",
  SUPERADMIN: "superadmin",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  skillGroupId?: string | null;
};

// Hierarchy: superadmin > admin > tutor > user
function hasMinRole(userRole: Role, required: Role): boolean {
  const hierarchy = {
    user: 0,
    tutor: 1,
    admin: 2,
    superadmin: 3,
  };
  return hierarchy[userRole] >= hierarchy[required];
}

// Throws Unauthorized if not admin or superadmin
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!hasMinRole(user.role as Role, ROLES.ADMIN)) {
    throw new Error("Unauthorized: Admin role required");
  }
  return user as AuthUser;
}

// Throws Unauthorized if not superadmin
export async function requireSuperAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== ROLES.SUPERADMIN) {
    throw new Error("Unauthorized: SuperAdmin role required");
  }
  return user as AuthUser;
}

// Fine-grained permission check (for UI show/hide)
export function canDeleteUsers(role: Role): boolean {
  return role === ROLES.SUPERADMIN;
}

export function canManageBilling(role: Role): boolean {
  return role === ROLES.SUPERADMIN;
}

export function canChangeRoles(role: Role): boolean {
  return role === ROLES.SUPERADMIN;
}

export function canApproveRoadmaps(role: Role): boolean {
  return role === ROLES.TUTOR;
}

export function canManageSkillGroups(role: Role): boolean {
  return role === ROLES.SUPERADMIN;
}
