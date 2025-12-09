"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { useTranslations } from "next-intl";
import { TrendingDown, AlertCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
}

interface TopExpensesChartProps {
  data: ExpenseItem[];
  currencyCode: string;
  topN?: number;
}

export function TopExpensesChart({ data, currencyCode, topN = 10 }: TopExpensesChartProps) {
  const t = useTranslations();

  const formatAmount = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  // Sort and get top N
  const topExpenses = [...data]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, topN)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      shortDesc: item.description.length > 25 ? item.description.substring(0, 25) + "..." : item.description,
    }));

  // Calculate insights
  const totalTop = topExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAll = data.reduce((sum, e) => sum + e.amount, 0);
  const percentageOfTotal = totalAll > 0 ? (totalTop / totalAll) * 100 : 0;

  // Color gradient based on rank
  const getBarColor = (rank: number) => {
    if (rank === 1) return "#ef4444"; // red-500
    if (rank <= 3) return "#f97316"; // orange-500
    if (rank <= 5) return "#f59e0b"; // amber-500
    return "#eab308"; // yellow-500
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border-2 bg-background/95 backdrop-blur-sm p-4 shadow-xl max-w-xs">
          <div className="flex items-start gap-2 mb-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-xs font-bold text-red-600">#{data.rank}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold break-words">{data.description}</p>
              {data.category && (
                <p className="text-xs text-muted-foreground mt-1">{data.category}</p>
              )}
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t("entry.amount")}</span>
              <span className="text-lg font-bold text-red-600">
                {data.amount.toLocaleString()} {currencyCode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t("entry.date")}</span>
              <span className="text-xs font-medium">
                {new Date(data.date).toLocaleDateString()}
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
            <TrendingDown className="h-5 w-5 text-red-500" />
            {t("charts.topExpenses")}
          </CardTitle>
          <CardDescription>{t("charts.topExpensesDescription")}</CardDescription>
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
              <TrendingDown className="h-5 w-5 text-red-500" />
              {t("charts.topExpenses")} (Top {topN})
            </CardTitle>
            <CardDescription className="mt-1.5">{t("charts.topExpensesDescription")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {/* Insights */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-3">
            <p className="text-xs text-muted-foreground mb-1">{t("charts.topTotal")}</p>
            <p className="text-lg font-bold text-red-600">{formatAmount(totalTop)} {currencyCode}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">{t("charts.percentOfTotal")}</p>
            <p className="text-lg font-bold">{percentageOfTotal.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">{t("charts.avgTopExpense")}</p>
            <p className="text-lg font-bold">{formatAmount(totalTop / topExpenses.length)} {currencyCode}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topExpenses}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" horizontal={false} />
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatAmount}
              />
              <YAxis
                type="category"
                dataKey="shortDesc"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={95}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }} />
              <Bar dataKey="amount" radius={[0, 8, 8, 0]} maxBarSize={30}>
                {topExpenses.map((entry) => (
                  <Cell key={`cell-${entry.id}`} fill={getBarColor(entry.rank)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Warning */}
        {percentageOfTotal > 50 && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  {t("charts.topExpensesWarning")}
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {t("charts.topExpensesWarningDesc", { percent: percentageOfTotal.toFixed(0) })}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
