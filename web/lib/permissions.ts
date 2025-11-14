import type { Role } from "@/lib/api";

export interface BudgetPermissions {
  canView: boolean;
  canAddEntries: boolean;
  canEditEntries: boolean;
  canManageCategories: boolean;
  canViewMembers: boolean;
  canManageMembers: boolean;
  canManageSettings: boolean;
  canDeleteBudget: boolean;
}

export interface TabPermissions {
  overview: boolean;
  categories: boolean;
  entries: boolean;
  members: boolean;
  summary: boolean;
  settings: boolean;
}

/**
 * Get permissions for a user role in a budget
 */
export function getBudgetPermissions(role: Role): BudgetPermissions {
  switch (role) {
    case "owner":
      return {
        canView: true,
        canAddEntries: true,
        canEditEntries: true,
        canManageCategories: true,
        canViewMembers: true,
        canManageMembers: true,
        canManageSettings: true,
        canDeleteBudget: true,
      };
    case "manager":
      return {
        canView: true,
        canAddEntries: true,
        canEditEntries: true,
        canManageCategories: true,
        canViewMembers: false,
        canManageMembers: false,
        canManageSettings: true,
        canDeleteBudget: false,
      };
    case "contributor":
      return {
        canView: true,
        canAddEntries: true,
        canEditEntries: true,
        canManageCategories: false,
        canViewMembers: false,
        canManageMembers: false,
        canManageSettings: false,
        canDeleteBudget: false,
      };
    case "viewer":
      return {
        canView: true,
        canAddEntries: false,
        canEditEntries: false,
        canManageCategories: false,
        canViewMembers: false,
        canManageMembers: false,
        canManageSettings: false,
        canDeleteBudget: false,
      };
    default:
      return {
        canView: false,
        canAddEntries: false,
        canEditEntries: false,
        canManageCategories: false,
        canViewMembers: false,
        canManageMembers: false,
        canManageSettings: false,
        canDeleteBudget: false,
      };
  }
}

/**
 * Get tab visibility permissions for a user role
 */
export function getTabPermissions(role: Role): TabPermissions {
  const permissions = getBudgetPermissions(role);
  
  return {
    overview: permissions.canView,
    categories: permissions.canView,
    entries: permissions.canView,
    members: permissions.canViewMembers,
    summary: permissions.canView,
    settings: permissions.canManageSettings,
  };
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(role: Role, permission: keyof BudgetPermissions): boolean {
  const permissions = getBudgetPermissions(role);
  return permissions[permission];
}

/**
 * Check if user can access a specific tab
 */
export function canAccessTab(role: Role, tab: keyof TabPermissions): boolean {
  const tabPermissions = getTabPermissions(role);
  return tabPermissions[tab];
}