"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { BudgetSettings } from "@/components/features/budgets/budget-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useBudgetRole } from "@/lib/useBudgetRole";

export default function BudgetSettingsPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const { isOwner, isManager } = useBudgetRole(params.id);

  const budgetQuery = useQuery({
    queryKey: ["budget", params.id],
    queryFn: () => api.budgets.detail(params.id),
  });

  if (budgetQuery.isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </CardContent>
      </Card>
    );
  }

  if (budgetQuery.error || !budgetQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('overview.budgetNotFound')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('overview.couldntLoad')}</p>
        </CardContent>
      </Card>
    );
  }

  const budget = budgetQuery.data;
  const canEdit = isOwner || isManager;
  const canDelete = isOwner;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t('settings.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('budget.manageBudget')}
        </p>
      </div>

      <BudgetSettings 
        budget={budget} 
        canEdit={canEdit} 
        canDelete={canDelete} 
      />

      {!canEdit && !canDelete && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              {t('members.onlyOwners')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
