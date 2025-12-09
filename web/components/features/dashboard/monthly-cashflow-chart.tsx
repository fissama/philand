"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine } from "recharts";
import { useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

import type { MonthlySummary } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MonthlyCashflowChartProps {
  data: MonthlySummary[];
  currencyCode: string;
}

export function MonthlyCashflowChart({ data, currencyCode }: MonthlyCashflowChartProps) {
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

  // Calculate summary stats
  const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);
  const totalNet = totalIncome - totalExpense;
  const avgNet = data.length > 0 ? totalNet / data.length : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const monthData = payload[0].payload;
      return (
        <div className="rounded-xl border-2 bg-background/95 backdrop-blur-sm p-4 shadow-xl">
          <p className="text-sm font-semibold mb-3 pb-2 border-b">
            {new Date(monthData.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-muted-foreground">{t('entry.income')}</span>
              </div>
              <span className="text-sm font-bold text-emerald-600">
                {monthData.income.toLocaleString()} {currencyCode}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-muted-foreground">{t('entry.expense')}</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {monthData.expense.toLocaleString()} {currencyCode}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-muted-foreground">{t('charts.net')}</span>
              </div>
              <span className={cn("text-sm font-bold", monthData.net >= 0 ? "text-blue-600" : "text-orange-600")}>
                {monthData.net >= 0 ? '+' : ''}{monthData.net.toLocaleString()} {currencyCode}
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
        <div className="w-3 h-0.5 bg-emerald-500" />
        <span className="text-xs font-medium text-muted-foreground">{t('entry.income')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-red-500" />
        <span className="text-xs font-medium text-muted-foreground">{t('entry.expense')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-0.5 bg-blue-500" />
        <span className="text-xs font-medium text-muted-foreground">{t('charts.net')}</span>
      </div>
    </div>
  );

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            {t('charts.monthlyCashflow')}
          </CardTitle>
          <CardDescription>{t('charts.cashflowDescription')}</CardDescription>
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
              <Activity className="h-5 w-5 text-blue-500" />
              {t('charts.monthlyCashflow')}
            </CardTitle>
            <CardDescription className="mt-1.5">{t('charts.cashflowDescription')}</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {totalNet >= 0 ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                <span className="font-semibold">+{formatAmount(totalNet)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                <TrendingDown className="h-3 w-3" />
                <span className="font-semibold">{formatAmount(totalNet)}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                dot={{ fill: '#10b981', r: 3, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                name="income"
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#ef4444" 
                strokeWidth={2.5} 
                dot={{ fill: '#ef4444', r: 3, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                name="expense"
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                name="net"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend />
      </CardContent>
    </Card>
  );
}
