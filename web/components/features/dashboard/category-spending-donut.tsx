"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useTranslations } from 'next-intl';
import { PieChart as PieChartIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CategorySpendingDonutProps {
  data: { name: string; value: number; kind: 'income' | 'expense' }[];
  currencyCode: string;
  title?: string;
  description?: string;
}

const EXPENSE_COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#eab308", // yellow-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#14b8a6", // teal-500
  "#06b6d4"  // cyan-500
];

const INCOME_COLORS = [
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#06b6d4", // cyan-500
  "#0ea5e9", // sky-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#a855f7"  // purple-500
];

export function CategorySpendingDonut({ 
  data, 
  currencyCode, 
  title,
  description 
}: CategorySpendingDonutProps) {
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

  // Separate expenses and income
  const expenseData = data.filter(d => d.kind === 'expense' && d.value > 0);
  const incomeData = data.filter(d => d.kind === 'income' && d.value > 0);
  
  // Use expense data by default, or income if no expenses
  const chartData = expenseData.length > 0 ? expenseData : incomeData;
  const colors = expenseData.length > 0 ? EXPENSE_COLORS : INCOME_COLORS;
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="rounded-xl border-2 bg-background/95 backdrop-blur-sm p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.payload.fill }} />
            <p className="text-sm font-semibold">{data.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold">
              {data.value.toLocaleString()} {currencyCode}
            </p>
            <p className="text-xs text-muted-foreground">
              {percentage}% of total
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.08) return null; // Don't show label if less than 8%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-bold drop-shadow-lg"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-purple-500" />
            {title || t('charts.categorySpending')}
          </CardTitle>
          <CardDescription>{description || t('charts.categorySpendingDescription')}</CardDescription>
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
          <PieChartIcon className="h-5 w-5 text-purple-500" />
          {title || t('charts.categorySpending')}
        </CardTitle>
        <CardDescription className="mt-1.5">{description || t('charts.categorySpendingDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="45%" 
                innerRadius={65} 
                outerRadius={105} 
                paddingAngle={3}
                label={renderCustomLabel}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={colors[index % colors.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-10%' }}>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatAmount(total)}</p>
              <p className="text-xs text-muted-foreground mt-1">{currencyCode}</p>
            </div>
          </div>
        </div>
        {/* Custom Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4 max-h-24 overflow-y-auto">
          {chartData.map((entry, index) => {
            const percentage = ((entry.value / total) * 100).toFixed(1);
            return (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="truncate flex-1 font-medium">{entry.name}</span>
                <span className="text-muted-foreground font-semibold">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
