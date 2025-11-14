"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type PeriodFilter = "last3Months" | "last6Months" | "thisYear" | "lastYear";

export default function BudgetSummaryPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const [period, setPeriod] = useState<PeriodFilter>("last6Months");

  const budgetQuery = useQuery({
    queryKey: ["budget", params.id],
    queryFn: () => api.budgets.detail(params.id)
  });

  const dateRange = useMemo(() => {
    const now = new Date();
    let from: string;
    let to: string = now.toISOString().split("T")[0];

    switch (period) {
      case "last3Months": {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        from = threeMonthsAgo.toISOString().split("T")[0];
        break;
      }
      case "last6Months": {
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        from = sixMonthsAgo.toISOString().split("T")[0];
        break;
      }
      case "thisYear": {
        from = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
        break;
      }
      case "lastYear": {
        from = new Date(now.getFullYear() - 1, 0, 1).toISOString().split("T")[0];
        to = new Date(now.getFullYear() - 1, 11, 31).toISOString().split("T")[0];
        break;
      }
    }

    return { from, to };
  }, [period]);

  const summaryQuery = useQuery({
    queryKey: ["summary", params.id, dateRange],
    queryFn: () => api.summary.monthly(params.id, dateRange)
  });

  const entriesQuery = useQuery({
    queryKey: ["entries", params.id, dateRange],
    queryFn: () => api.entries.list(params.id, dateRange)
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories", params.id],
    queryFn: () => api.categories.list(params.id)
  });

  const budget = budgetQuery.data;
  const monthlyData = summaryQuery.data ?? [];
  const entries = entriesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  // Calculate insights
  const insights = useMemo(() => {
    if (!monthlyData.length) return null;

    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
    const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);
    const net = totalIncome - totalExpense;
    const avgMonthlyIncome = totalIncome / monthlyData.length;
    const avgMonthlyExpense = totalExpense / monthlyData.length;

    // Find best and worst months
    const sortedByNet = [...monthlyData].sort((a, b) => b.net - a.net);
    const bestMonth = sortedByNet[0];
    const worstMonth = sortedByNet[sortedByNet.length - 1];

    // Category breakdown
    const categoryTotals = categories.map((cat) => {
      const total = entries
        .filter((e) => e.category_id === cat.id)
        .reduce((sum, e) => sum + e.amount_minor, 0);
      return { ...cat, total: total / 100 };
    }).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

    return {
      totalIncome,
      totalExpense,
      net,
      avgMonthlyIncome,
      avgMonthlyExpense,
      bestMonth,
      worstMonth,
      categoryTotals,
      monthCount: monthlyData.length
    };
  }, [monthlyData, entries, categories]);

  const formatAmount = (amount: number) =>
    amount % 1 === 0
      ? amount.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (summaryQuery.isLoading || budgetQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!budget || !insights) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">{t('summary.noDataAvailable')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('summary.financialSummary')}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}
          </p>
        </div>
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={period}
          onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
        >
          <option value="last3Months">{t('summary.last3Months')}</option>
          <option value="last6Months">{t('summary.last6Months')}</option>
          <option value="thisYear">{t('summary.thisYear')}</option>
          <option value="lastYear">{t('summary.lastYear')}</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('summary.totalIncome')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatAmount(insights.totalIncome)} {budget.currency_code}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('summary.avg')}: {formatAmount(insights.avgMonthlyIncome)} {budget.currency_code}/{t('summary.month')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('summary.totalExpense')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatAmount(insights.totalExpense)} {budget.currency_code}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('summary.avg')}: {formatAmount(insights.avgMonthlyExpense)} {budget.currency_code}/{t('summary.month')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('summary.netBalance')}</CardTitle>
            <DollarSign className={cn("h-4 w-4", insights.net >= 0 ? "text-emerald-600" : "text-red-600")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", insights.net >= 0 ? "text-emerald-600" : "text-red-600")}>
              {formatAmount(insights.net)} {budget.currency_code}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {insights.net >= 0 ? t('summary.surplus') : t('summary.deficit')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('entry.transactions')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('summary.over')} {insights.monthCount} {insights.monthCount === 1 ? t('summary.month') : t('summary.months')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t('summary.monthlyBreakdown')}</CardTitle>
          <CardDescription>{t('summary.incomeExpenseNet')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthlyData.map((month) => {
              const monthDate = new Date(month.month);
              const monthName = monthDate.toLocaleDateString(undefined, { month: "short", year: "numeric" });

              return (
                <div key={month.month} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{monthName}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="text-emerald-600">↑ {formatAmount(month.income)}</span>
                      <span className="text-red-600">↓ {formatAmount(month.expense)}</span>
                    </div>
                  </div>
                  <div className={cn("text-right font-semibold", month.net >= 0 ? "text-emerald-600" : "text-red-600")}>
                    {month.net >= 0 ? "+" : ""}{formatAmount(month.net)} {budget.currency_code}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {insights.categoryTotals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('summary.topCategories')}</CardTitle>
            <CardDescription>{t('summary.spendingIncome')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.categoryTotals.slice(0, 10).map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{cat.name}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      cat.kind === "income"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {cat.kind}
                    </span>
                  </div>
                  <span className={cn("font-semibold", cat.kind === "income" ? "text-emerald-600" : "text-red-600")}>
                    {formatAmount(Math.abs(cat.total))} {budget.currency_code}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Best/Worst Months */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-600">{t('summary.bestMonth')}</CardTitle>
            <CardDescription>{t('summary.highestNet')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {new Date(insights.bestMonth.month).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">
              +{formatAmount(insights.bestMonth.net)} {budget.currency_code}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">{t('summary.worstMonth')}</CardTitle>
            <CardDescription>{t('summary.lowestNet')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {new Date(insights.worstMonth.month).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {formatAmount(insights.worstMonth.net)} {budget.currency_code}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
