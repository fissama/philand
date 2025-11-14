import { useQuery } from "@tanstack/react-query";
import { api, type Role } from "@/lib/api";
import { getBudgetPermissions, getTabPermissions, type BudgetPermissions, type TabPermissions } from "@/lib/permissions";

/**
 * Hook to get budget permissions based on the user's role for a specific budget.
 * This hook fetches the budget details which include the user's role.
 */
export function useBudgetPermissions(budgetId: string): {
  role: Role | undefined;
  permissions: BudgetPermissions;
  tabPermissions: TabPermissions;
  isLoading: boolean;
  // Legacy compatibility
  isOwner: boolean;
  isManager: boolean;
  isContributor: boolean;
  isViewer: boolean;
} {
  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => api.budgets.list(),
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  const budget = budgets?.find((b) => b.id === budgetId);
  const role = budget?.user_role;
  
  const permissions = role ? getBudgetPermissions(role) : {
    canView: false,
    canAddEntries: false,
    canEditEntries: false,
    canManageCategories: false,
    canViewMembers: false,
    canManageMembers: false,
    canManageSettings: false,
    canDeleteBudget: false,
  };

  const tabPermissions = role ? getTabPermissions(role) : {
    overview: false,
    categories: false,
    entries: false,
    members: false,
    summary: false,
    settings: false,
  };

  return {
    role,
    permissions,
    tabPermissions,
    isLoading,
    // Legacy compatibility for existing code
    isOwner: role === "owner",
    isManager: role === "manager" || role === "owner",
    isContributor: role === "contributor" || role === "manager" || role === "owner",
    isViewer: Boolean(role),
  };
}