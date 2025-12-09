"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WeekdayData {
  weekday: number; // 0 = Sunday, 6 = Saturday
  income: number;
  expense: number;
}

interface WeekdaySpendingChartProps {
  data: WeekdayData[];
  currencyCode: string;
}

export function WeekdaySpendingChart({ data, currencyCode }: WeekdaySpendingChartProps) {
  const t = useTranslations();

  const formatAmount = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (absValue >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Prepare chart data
  const chartData = weekdayNames.map((name, index) => {
    const dayData = data.find((d) => d.weekday === index) || { weekday: index, income: 0, expense: 0 };
    return {
      name,
      income: dayData.income,
      expense: dayData.expense,
      net: dayData.income - dayData.expense,
      isWeekend: index === 0 || index === 6,
    };
  });

  // Calculate insights
  const weekdayAvg = chartData
    .filter((d) => !d.isWeekend)
    .reduce((sum, d) => sum + d.expense, 0) / 5;
  const weekendAvg = chartData
    .filter((d) => d.isWeekend)
    .reduce((sum, d) => sum + d.expense, 0) / 2;
  const highestDay = chartData.reduce((max, d) => (d.expense > max.expense ? d : max), chartData[0]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border-2 bg-background/95 backdrop-blur-sm p-4 shadow-xl">
          <p className="text-sm font-semibold mb-3 pb-2 border-b">{data.name}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-xs font-medium text-muted-foreground">{t("entry.income")}</span>
              </div>
              <span className="text-sm font-bold text-emerald-600">
                {data.income.toLocaleString()} {currencyCode}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-xs font-medium text-muted-foreground">{t("entry.expense")}</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {data.expense.toLocaleString()} {currencyCode}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6 pt-2 border-t">
              <span className="text-xs font-medium text-muted-foreground">{t("charts.net")}</span>
              <span className={cn("text-sm font-bold", data.net >= 0 ? "text-blue-600" : "text-orange-600")}>
                {data.net >= 0 ? "+" : ""}
                {data.net.toLocaleString()} {currencyCode}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            {t("charts.weekdaySpending")}
          </CardTitle>
          <CardDescription>{t("charts.weekdaySpendingDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            {t("charts.noDataAvailable")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              {t("charts.weekdaySpending")}
            </CardTitle>
            <CardDescription className="mt-1.5">{t("charts.weekdaySpendingDescription")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {/* Insights */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">{t("charts.weekdayAvg")}</p>
            <p className="text-lg font-bold">{formatAmount(weekdayAvg)} {currencyCode}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">{t("charts.weekendAvg")}</p>
            <p className="text-lg font-bold">{formatAmount(weekendAvg)} {currencyCode}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">{t("charts.highestDay")}</p>
            <p className="text-lg font-bold">{highestDay.name}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatAmount}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }} />
              <Bar dataKey="income" fill="url(#incomeGrad)" radius={[6, 6, 0, 0]} maxBarSize={50} />
              <Bar dataKey="expense" fill="url(#expenseGrad)" radius={[6, 6, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">{t("entry.income")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-red-500" />
            <span className="text-xs font-medium text-muted-foreground">{t("entry.expense")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-900/30" />
            <span className="text-xs font-medium text-muted-foreground">{t("charts.weekday")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-100 dark:bg-purple-900/30" />
            <span className="text-xs font-medium text-muted-foreground">{t("charts.weekend")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
