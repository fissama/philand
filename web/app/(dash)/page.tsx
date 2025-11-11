"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { BudgetCard } from "@/components/features/budgets/budget-card";
import { MonthlyLineChart } from "@/components/features/dashboard/monthly-line-chart";
import { CategoryDonut } from "@/components/features/dashboard/category-donut";
import { KPIStat } from "@/components/features/dashboard/kpi-stat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);

  const budgetsQuery = useQuery({ queryKey: ["budgets"], queryFn: api.budgets.list });

  const budgetId = selectedBudget ?? budgetsQuery.data?.[0]?.id ?? null;

  const summaryQuery = useQuery({
    queryKey: ["summary", budgetId],
    queryFn: () => (budgetId ? api.summary.monthly(budgetId) : Promise.resolve([])),
    enabled: Boolean(budgetId)
  });

  const kpis = useMemo(() => {
    if (!summaryQuery.data?.length) return null;
    const current = summaryQuery.data[summaryQuery.data.length - 1];
    return [
      {
        label: "Monthly income",
        value: current.income.toLocaleString(undefined, { style: "currency", currency: "USD" }),
        trend: "up" as const
      },
      {
        label: "Monthly expense",
        value: current.expense.toLocaleString(undefined, { style: "currency", currency: "USD" }),
        trend: "down" as const
      },
      {
        label: "Net",
        value: current.net.toLocaleString(undefined, { style: "currency", currency: "USD" })
      }
    ];
  }, [summaryQuery.data]);

  const categoryData = useMemo(
    () =>
      summaryQuery.data?.map((item) => ({
        name: item.month,
        value: Math.abs(item.net)
      })) ?? [],
    [summaryQuery.data]
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track budgets at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          {budgetsQuery.isLoading ? (
            <Skeleton className="h-10 w-32" />
          ) : budgetsQuery.data?.map((budget) => (
            <Button
              key={budget.id}
              variant={budgetId === budget.id ? "default" : "outline"}
              onClick={() => setSelectedBudget(budget.id)}
            >
              {budget.name}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Your budgets</h2>
        {budgetsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : budgetsQuery.data?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {budgetsQuery.data.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No budgets yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Start by creating a budget from the Budgets page to see your financial overview here.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {summaryQuery.isLoading ? (
          <div className="flex h-80 items-center justify-center rounded-2xl border border-border">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <MonthlyLineChart data={summaryQuery.data ?? []} />
        )}
        <CategoryDonut data={categoryData} />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Key metrics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {kpis?.map((kpi) => (
            <KPIStat key={kpi.label} {...kpi} />
          )) ?? (
            <p className="text-sm text-muted-foreground">No metrics yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
