"use client";

import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";

import type { BudgetSummary } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBudgetTypeInfo } from "@/lib/budget-types";

interface BudgetCardProps {
  budget: BudgetSummary;
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const t = useTranslations();
  const currency = budget.currency_code || "USD";
  const typeInfo = getBudgetTypeInfo(budget.budget_type);
  const TypeIcon = typeInfo.icon;

  return (
    <Link href={`/budgets/${budget.id}`} className="block group">
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50 bg-gradient-to-br from-card via-card to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className={`rounded-lg p-1.5 ${typeInfo.bgColor} ${typeInfo.borderColor} border`}>
                  <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                </div>
                <span className={`text-xs font-medium ${typeInfo.color}`}>
                  {t(typeInfo.labelKey as any)}
                </span>
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {budget.name}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <span className="font-semibold text-primary">{currency}</span>
                {budget.archived ? (
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {t('budget.archived')}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {t('budget.active')}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
              <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {budget.description ? (
            <div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {budget.description}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground italic">
                {t('budget.description')}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {t('overview.created')} {new Date(budget.created_at).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="text-xs font-medium text-primary group-hover:underline">
              {t('budget.budgetDetails')} →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
