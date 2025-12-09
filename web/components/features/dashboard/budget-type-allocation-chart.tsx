"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { useTranslations } from 'next-intl';
import { Wallet, TrendingUp, CreditCard, LineChart, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Budget } from "@/lib/api";

interface BudgetTypeAllocationChartProps {
  budgets: Budget[];
  currencyCode: string;
}

const BUDGET_TYPE_CONFIG: Record<string, { color: string; icon: any; gradient: string }> = {
  standard: { 
    color: "#3b82f6", 
    icon: Wallet,
    gradient: "from-blue-500 to-blue-600"
  },
  saving: { 
    color: "#10b981", 
    icon: TrendingUp,
    gradient: "from-emerald-500 to-emerald-600"
  },
  debt: { 
    color: "#ef4444", 
    icon: CreditCard,
    gradient: "from-red-500 to-red-600"
  },
  investment: { 
    color: "#8b5cf6", 
    icon: LineChart,
    gradient: "from-violet-500 to-violet-600"
  },
  sharing: { 
    color: "#f59e0b", 
    icon: Users,
    gradient: "from-amber-500 to-amber-600"
  }
};

export function BudgetTypeAllocationChart({ budgets, currencyCode }: BudgetTypeAllocationChartProps) {
  const t = useTranslations();
  
  const formatAmount = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (absValue >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value % 1 === 0
      ? value.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Group budgets by type and calculate totals
  const budgetTypeData = budgets.reduce((acc, budget) => {
    const type = budget.budget_type || 'standard';
    if (!acc[type]) {
      acc[type] = {
        type,
        total: 0,
        count: 0
      };
    }
    // Calculate balance from totalIncome and totalExpense if available
    const balance = (budget.totalIncome || 0) - (budget.totalExpense || 0);
    acc[type].total += balance;
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { type: string; total: number; count: number }>);

  const chartData = Object.values(budgetTypeData).map(item => ({
    name: t(`budgetType.${item.type}` as any),
    value: item.total,
    count: item.count,
    type: item.type
  })).sort((a, b) => b.value - a.value);

  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalAmount > 0 ? ((data.value / totalAmount) * 100).toFixed(1) : '0';
      const Icon = BUDGET_TYPE_CONFIG[data.type]?.icon || Wallet;
      
      return (
        <div className="rounded-xl border-2 bg-background/95 backdrop-blur-sm p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: `${BUDGET_TYPE_CONFIG[data.type]?.color}20` }}
            >
              <Icon className="h-4 w-4" style={{ color: BUDGET_TYPE_CONFIG[data.type]?.color }} />
            </div>
            <p className="text-sm font-semibold">{data.name}</p>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('charts.total')}</p>
              <p className="text-lg font-bold">
                {data.value.toLocaleString()} {currencyCode}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                {data.count} {data.count === 1 ? t('budget.name') : t('budget.budgets')}
              </span>
              <span className="text-xs font-semibold">
                {percentage}% of total
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-500" />
            {t('charts.budgetTypeAllocation')}
          </CardTitle>
          <CardDescription>{t('charts.budgetTypeDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            {t('charts.noDataAvailable')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-500" />
          {t('charts.budgetTypeAllocation')}
        </CardTitle>
        <CardDescription className="mt-1.5">{t('charts.budgetTypeDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={BUDGET_TYPE_CONFIG[entry.type]?.color || "#3b82f6"}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Custom Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t">
          {chartData.map((entry, idx) => {
            const Icon = BUDGET_TYPE_CONFIG[entry.type]?.icon || Wallet;
            const percentage = totalAmount > 0 ? ((entry.value / totalAmount) * 100).toFixed(0) : '0';
            
            return (
              <div key={`${entry.type}-${idx}`} className="flex items-center gap-2">
                <div 
                  className="p-1.5 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${BUDGET_TYPE_CONFIG[entry.type]?.color}20` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: BUDGET_TYPE_CONFIG[entry.type]?.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
