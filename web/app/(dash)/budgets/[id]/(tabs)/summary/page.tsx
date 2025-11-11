"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { CategoryDonut } from "@/components/features/dashboard/category-donut";
import { MonthlyLineChart } from "@/components/features/dashboard/monthly-line-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

export default function BudgetSummaryPage() {
  const params = useParams<{ id: string }>();
  const summaryQuery = useQuery({ queryKey: ["summary", params.id], queryFn: () => api.summary.monthly(params.id) });

  if (summaryQuery.isLoading) {
    return <Skeleton className="h-80 rounded-2xl" />;
  }

  const data = summaryQuery.data ?? [];
  const donut = data.map((item) => ({ name: item.month, value: Math.abs(item.net) }));

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <MonthlyLineChart data={data} />
      <CategoryDonut data={donut} />
    </div>
  );
}
