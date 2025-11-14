"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';

import { BudgetCard } from "@/components/features/budgets/budget-card";
import { GlobalQuickAddEntry } from "@/components/features/entries/global-quick-add-entry";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const t = useTranslations();
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);

  const budgetsQuery = useQuery({ queryKey: ["budgets"], queryFn: () => api.budgets.list() });
  const budgetId = selectedBudget ?? budgetsQuery.data?.[0]?.id ?? null;

  // Get this month's date range
  const thisMonth = useMemo(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      from: firstDay.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0]
    };
  }, []);

  const entriesQuery = useQuery({
    queryKey: ["entries", budgetId, thisMonth],
    queryFn: () => {
      if (!budgetId) return Promise.resolve([]);
      return api.entries.list(budgetId, {
        from: thisMonth.from,
        to: thisMonth.to
      });
    },
    enabled: Boolean(budgetId)
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories", budgetId],
    queryFn: () => {
      if (!budgetId) return Promise.resolve([]);
      return api.categories.list(budgetId);
    },
    enabled: Boolean(budgetId)
  });

  const selectedBudgetData = budgetsQuery.data?.find((b) => b.id === budgetId);
  const entries = entriesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  // Calculate this month's summary
  const monthSummary = useMemo(() => {
    const income = entries
      .filter((e) => e.kind === "income")
      .reduce((sum, e) => sum + e.amount_minor, 0) / 100;
    const expense = entries
      .filter((e) => e.kind === "expense")
      .reduce((sum, e) => sum + e.amount_minor, 0) / 100;
    return { income, expense, net: income - expense };
  }, [entries]);

  // Get recent entries (last 5)
  const recentEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
      .slice(0, 5);
  }, [entries]);

  // Calculate category totals
  const categoryTotals = useMemo(() => {
    return categories
      .map((cat) => {
        const total = entries
          .filter((e) => e.category_id === cat.id)
          .reduce((sum, e) => sum + e.amount_minor, 0) / 100;
        return { ...cat, total };
      })
      .filter((cat) => cat.total !== 0)
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
      .slice(0, 5);
  }, [entries, categories]);

  const formatAmount = (amount: number) =>
    amount % 1 === 0
      ? amount.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <GlobalQuickAddEntry 
            defaultBudgetId={budgetId || undefined}
            trigger={
              <Button className="gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('entry.addEntry')}
              </Button>
            }
          />
          <Link href="/budgets">
            <Button variant="outline" className="gap-2">
              <Wallet className="h-4 w-4" />
              {t('budget.budgets')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Budget Selector */}
      {budgetsQuery.data && budgetsQuery.data.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {budgetsQuery.data.map((budget) => (
            <Button
              key={budget.id}
              size="sm"
              variant={budgetId === budget.id ? "default" : "outline"}
              onClick={() => setSelectedBudget(budget.id)}
            >
              {budget.name}
            </Button>
          ))}
        </div>
      )}

      {budgetsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : !budgetId ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.noBudgets')}</CardTitle>
            <CardDescription>{t('dashboard.noBudgetsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/budgets">
              <Button>{t('dashboard.createBudget')}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* This Month Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('entry.income')} - {t('dashboard.thisMonth')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatAmount(monthSummary.income)} {selectedBudgetData?.currency_code}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {entries.filter((e) => e.kind === "income").length} {t('entry.entries').toLowerCase()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('entry.expense')} - {t('dashboard.thisMonth')}</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatAmount(monthSummary.expense)} {selectedBudgetData?.currency_code}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {entries.filter((e) => e.kind === "expense").length} {t('entry.entries').toLowerCase()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('entry.balance')}</CardTitle>
                <Wallet className={cn("h-4 w-4", monthSummary.net >= 0 ? "text-emerald-600" : "text-red-600")} />
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", monthSummary.net >= 0 ? "text-emerald-600" : "text-red-600")}>
                  {formatAmount(monthSummary.net)} {selectedBudgetData?.currency_code}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {monthSummary.net >= 0 ? t('entry.income') : t('entry.expense')}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
                  <CardDescription>{t('dashboard.thisMonth')}</CardDescription>
                </div>
                <Link href={`/budgets/${budgetId}/entries`}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    {t('entry.entries')}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('entry.noEntries')}</p>
                ) : (
                  <div className="space-y-3">
                    {recentEntries.map((entry) => {
                      const category = categories.find((c) => c.id === entry.category_id);
                      const amount = entry.amount_minor / 100;
                      return (
                        <div key={entry.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{entry.description || entry.counterparty || t('entry.description')}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.entry_date).toLocaleDateString()} • {category?.name || t('entry.noCategory')}
                            </p>
                          </div>
                          <span className={cn("text-sm font-semibold", entry.kind === "income" ? "text-emerald-600" : "text-red-600")}>
                            {entry.kind === "income" ? "+" : "-"}
                            {formatAmount(amount)} {entry.currency_code}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('dashboard.topCategories')}</CardTitle>
                  <CardDescription>{t('dashboard.thisMonth')}</CardDescription>
                </div>
                <Link href={`/budgets/${budgetId}/categories`}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    {t('category.categories')}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {categoryTotals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('category.noCategories')}</p>
                ) : (
                  <div className="space-y-3">
                    {categoryTotals.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{cat.name}</span>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            cat.kind === "income"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}>
                            {cat.kind}
                          </span>
                        </div>
                        <span className={cn("text-sm font-semibold", cat.kind === "income" ? "text-emerald-600" : "text-red-600")}>
                          {formatAmount(Math.abs(cat.total))} {selectedBudgetData?.currency_code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* All Budgets Overview */}
          {budgetsQuery.data && budgetsQuery.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.myBudgets')}</CardTitle>
                <CardDescription>{t('budget.budgets')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {budgetsQuery.data.map((budget) => (
                    <BudgetCard key={budget.id} budget={budget} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
