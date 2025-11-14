import type { Role } from "@/lib/api";

export const ROLE_PRIORITY: Record<Role, number> = {
  owner: 3,
  manager: 2,
  contributor: 1,
  viewer: 0
};

export function hasRole(userRole: Role | undefined | null, minimum: Role) {
  if (!userRole) return false;
  return ROLE_PRIORITY[userRole] >= ROLE_PRIORITY[minimum];
}
