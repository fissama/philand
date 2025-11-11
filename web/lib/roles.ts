import type { Role } from "@/lib/api";

export const ROLE_PRIORITY: Record<Role, number> = {
  Owner: 3,
  Manager: 2,
  Contributor: 1,
  Viewer: 0
};

export function hasRole(userRole: Role | undefined | null, minimum: Role) {
  if (!userRole) return false;
  return ROLE_PRIORITY[userRole] >= ROLE_PRIORITY[minimum];
}
