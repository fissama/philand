import { useQuery } from "@tanstack/react-query";
import { api, type Role } from "@/lib/api";
import { authStore } from "@/lib/auth";

/**
 * Hook to get the current user's role for a specific budget.
 * Returns the budget-specific role (Owner, Manager, Contributor, Viewer)
 * by checking the members list.
 */
export function useBudgetRole(budgetId: string): {
  role: Role | undefined;
  isLoading: boolean;
  isOwner: boolean;
  isManager: boolean;
  isContributor: boolean;
  isViewer: boolean;
} {
  const { user } = authStore();

  const { data: members, isLoading } = useQuery({
    queryKey: ["members", budgetId],
    queryFn: () => api.members.list(budgetId),
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  const role = members?.find((m) => m.user_id === user?.id)?.role;

  return {
    role,
    isLoading,
    isOwner: role === "owner",
    isManager: role === "manager" || role === "owner",
    isContributor: role === "contributor" || role === "manager" || role === "owner",
    isViewer: Boolean(role) // Any role means they can view
  };
}
