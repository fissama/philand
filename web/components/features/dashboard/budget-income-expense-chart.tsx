"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useTranslations } from 'next-intl';
import { BarChart3 } from "lucide-react";

import type { MonthlySummary } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BudgetIncomeExpenseChartProps {
  data: MonthlySummary[];
  currencyCode: string;
  title?: string;
  description?: string;
}

export function BudgetIncomeExpenseChart({ 
  data, 
  currencyCode,
  title,
  description 
}: BudgetIncomeExpenseChartProps) {
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

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr);
    return date.toLocaleDateString(undefined, { month: 'short' });
  };

  // Calculate totals
  const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);
  const avgIncome = data.length > 0 ? totalIncome / data.length : 0;
  const avgExpense = data.length > 0 ? totalExpense / data.length : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const monthData = payload[0].payload;
      const net = monthData.income - monthData.expense;
      
      return (
        <div className="rounded-xl border-2 bg-background/95 backdrop-blur-sm p-4 shadow-xl">
          <p className="text-sm font-semibold mb-3 pb-2 border-b">
            {new Date(monthData.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-xs font-medium text-muted-foreground">{t('entry.income')}</span>
              </div>
              <span className="text-sm font-bold text-emerald-600">
                {monthData.income.toLocaleString()} {currencyCode}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-xs font-medium text-muted-foreground">{t('entry.expense')}</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {monthData.expense.toLocaleString()} {currencyCode}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6 pt-2 border-t">
              <span className="text-xs font-medium text-muted-foreground">{t('charts.net')}</span>
              <span className={`text-sm font-bold ${net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {net >= 0 ? '+' : ''}{net.toLocaleString()} {currencyCode}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => (
    <div className="flex items-center justify-center gap-6 pt-4 pb-2">
      <div className="flex items-center gap-2">
        <div className="w-4 h-3 rounded bg-emerald-500" />
        <div className="text-left">
          <p className="text-xs font-medium text-muted-foreground">{t('entry.income')}</p>
          <p className="text-xs font-semibold">{formatAmount(avgIncome)} avg</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-3 rounded bg-red-500" />
        <div className="text-left">
          <p className="text-xs font-medium text-muted-foreground">{t('entry.expense')}</p>
          <p className="text-xs font-semibold">{formatAmount(avgExpense)} avg</p>
        </div>
      </div>
    </div>
  );

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            {title || t('charts.incomeVsExpense')}
          </CardTitle>
          <CardDescription>{description || t('charts.incomeVsExpenseDescription')}</CardDescription>
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
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              {title || t('charts.incomeVsExpense')}
            </CardTitle>
            <CardDescription className="mt-1.5">{description || t('charts.incomeVsExpenseDescription')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barGap={4}>
              <defs>
                <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={formatMonth}
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
              <Bar 
                dataKey="income" 
                fill="url(#incomeBar)" 
                radius={[6, 6, 0, 0]}
                name="income"
                maxBarSize={50}
              />
              <Bar 
                dataKey="expense" 
                fill="url(#expenseBar)" 
                radius={[6, 6, 0, 0]}
                name="expense"
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend />
      </CardContent>
    </Card>
  );
}
