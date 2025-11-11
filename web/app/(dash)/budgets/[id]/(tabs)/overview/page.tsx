"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { KPIStat } from "@/components/features/dashboard/kpi-stat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

export default function BudgetOverviewPage() {
  const params = useParams<{ id: string }>();
  const budgetQuery = useQuery({ queryKey: ["budgets", params.id], queryFn: () => api.budgets.detail(params.id) });

  if (budgetQuery.isLoading) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  if (!budgetQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">We couldn\'t load this budget. Try again later.</p>
        </CardContent>
      </Card>
    );
  }

  const budget = budgetQuery.data;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>About this budget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-semibold">{budget.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Currency</p>
            <p className="font-semibold">{budget.currency}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Owner</p>
            <p className="font-semibold">{budget.owner}</p>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        <KPIStat label="Total income" value={budget.totalIncome.toLocaleString()} trend="up" />
        <KPIStat label="Total expense" value={budget.totalExpense.toLocaleString()} trend="down" />
      </div>
    </div>
  );
}
