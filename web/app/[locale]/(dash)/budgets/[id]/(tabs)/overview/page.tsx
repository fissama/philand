"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from 'next-intl';

import { BudgetIncomeExpenseChart } from "@/components/features/dashboard/budget-income-expense-chart";
import { CategorySpendingDonut } from "@/components/features/dashboard/category-spending-donut";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { getBudgetTypeInfo } from "@/lib/budget-types";

type PeriodFilter = "thisWeek" | "thisMonth" | "lastMonth";

export default function BudgetOverviewPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const [period, setPeriod] = useState<PeriodFilter>("thisWeek");
  
  const budgetQuery = useQuery({ queryKey: ["budget", params.id], queryFn: () => api.budgets.detail(params.id) });
  const categoriesQuery = useQuery({ queryKey: ["categories", params.id], queryFn: () => api.categories.list(params.id) });
  
  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    let from: string;
    let to: string = now.toISOString().split("T")[0];
    
    switch (period) {
      case "thisWeek": {
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as start of week
        const monday = new Date(now);
        monday.setDate(now.getDate() - diff);
        from = monday.toISOString().split("T")[0];
        break;
      }
      case "thisMonth": {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        from = firstDay.toISOString().split("T")[0];
        break;
      }
      case "lastMonth": {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        from = firstDay.toISOString().split("T")[0];
        to = lastDay.toISOString().split("T")[0];
        break;
      }
    }
    
    return { from, to };
  }, [period]);

  // Get last 6 months for charts
  const last6Months = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    return {
      from: new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth(), 1).toISOString().split("T")[0],
      to: now.toISOString().split("T")[0]
    };
  }, []);
  
  const entriesQuery = useQuery({
    queryKey: ["entries", params.id, dateRange],
    queryFn: () => api.entries.list(params.id, dateRange)
  });

  // Fetch 6-month summary for charts
  const chartSummaryQuery = useQuery({
    queryKey: ["chart-summary", params.id, last6Months],
    queryFn: () => api.summary.monthly(params.id, last6Months)
  });

  const budget = budgetQuery.data;
  const categories = categoriesQuery.data ?? [];
  const entries = entriesQuery.data ?? [];
  const chartSummaryData = chartSummaryQuery.data ?? [];
  
  const budgetTypeInfo = budget ? getBudgetTypeInfo(budget.budget_type) : null;
  const TypeIcon = budgetTypeInfo?.icon;
  
  const createdDate = budget ? new Date(budget.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : "";
  
  // Calculate summary from entries
  const summary = useMemo(() => {
    const income = entries
      .filter((entry) => entry.kind === "income")
      .reduce((sum, entry) => sum + entry.amount_minor, 0);
    const expense = entries
      .filter((entry) => entry.kind === "expense")
      .reduce((sum, entry) => sum + entry.amount_minor, 0);
    
    return {
      income: income / 100,
      expense: expense / 100,
      net: (income - expense) / 100
    };
  }, [entries]);

  // Prepare category data for donut chart
  const categoryChartData = useMemo(() => {
    return categories
      .map((cat) => {
        const total = entries
          .filter((e) => e.category_id === cat.id)
          .reduce((sum, e) => sum + e.amount_minor, 0) / 100;
        return { name: cat.name, value: Math.abs(total), kind: cat.kind };
      })
      .filter((cat) => cat.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [entries, categories]);
  
  const getPeriodLabel = () => {
    switch (period) {
      case "thisWeek": return t('overview.thisWeek');
      case "thisMonth": return t('overview.thisMonth');
      case "lastMonth": return t('overview.lastMonth');
    }
  };

  if (budgetQuery.isLoading) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  if (!budget) {
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

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('overview.budgetDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t('budget.name')}</p>
              <p className="font-semibold text-base">{budget.name}</p>
            </div>
            
            {budgetTypeInfo && TypeIcon && (
              <div>
                <p className="text-muted-foreground mb-2">{t('budget.type')}</p>
                <div className={`inline-flex items-center gap-3 rounded-lg border-2 ${budgetTypeInfo.borderColor} ${budgetTypeInfo.bgColor} px-4 py-2.5`}>
                  <div className={`rounded-lg p-2 bg-background/50`}>
                    <TypeIcon className={`h-6 w-6 ${budgetTypeInfo.color}`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${budgetTypeInfo.color}`}>
                      {t(budgetTypeInfo.labelKey as any)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(budgetTypeInfo.descriptionKey as any)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {budget.description && (
              <div>
                <p className="text-muted-foreground">{t('budget.description')}</p>
                <p className="font-medium">{budget.description}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">{t('budget.currency')}</p>
              <p className="font-semibold">{budget.currency_code}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('overview.created')}</p>
              <p className="font-medium">{createdDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('overview.status')}</p>
              <p className="font-medium">
                {budget.archived ? (
                  <span className="text-muted-foreground">{t('overview.archived')}</span>
                ) : (
                  <span className="text-green-600">{t('overview.active')}</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('category.categories')}</p>
              <p className="font-semibold">{categories.length} {categories.length === 1 ? t('category.name').toLowerCase() : t('category.categories').toLowerCase()}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>{t('overview.financialSummary')}</CardTitle>
              <select
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
              >
                <option value="thisWeek">{t('overview.thisWeek')}</option>
                <option value="thisMonth">{t('overview.thisMonth')}</option>
                <option value="lastMonth">{t('overview.lastMonth')}</option>
              </select>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{getPeriodLabel()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}
                </p>
              </div>
              
              {entriesQuery.isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('overview.income')}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatMoney(summary.income, budget.currency_code)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('overview.expense')}</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatMoney(summary.expense, budget.currency_code)}
                    </p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">{t('overview.netBalance')}</p>
                    <p className={`text-2xl font-bold ${
                      summary.net >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {formatMoney(summary.net, budget.currency_code)}
                    </p>
                  </div>
                  <div className="text-center pt-2">
                    <p className="text-xs text-muted-foreground">
                      {t('overview.basedOn')} {entries.length} {entries.length === 1 ? t('overview.entry') : t('entry.entries').toLowerCase()}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      {(chartSummaryData.length > 0 || categoryChartData.length > 0) && (
        <div className="space-y-6">
          {/* Budget Income vs Expense Over Time - Full Width */}
          {chartSummaryData.length > 0 && budget && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <BudgetIncomeExpenseChart 
                data={chartSummaryData}
                currencyCode={budget.currency_code}
                title={t('overview.performanceOverTime')}
                description={t('overview.last6Months')}
              />
            </div>
          )}

          {/* Category Breakdown for Selected Period */}
          {categoryChartData.length > 0 && budget && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <CategorySpendingDonut 
                data={categoryChartData}
                currencyCode={budget.currency_code}
                title={t('overview.categoryBreakdown')}
                description={getPeriodLabel()}
              />
            </div>
          )}
        </div>
      )}

      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('category.categories')} ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <span className="font-medium">{category.name}</span>
                  <span className={`text-xs font-semibold uppercase ${
                    category.kind === "income" ? "text-green-600" : "text-red-600"
                  }`}>
                    {category.kind}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
