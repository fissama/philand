"use client";

import { useTranslations } from 'next-intl';
import { Target, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BudgetProgressItem {
  id: string;
  name: string;
  used: number;
  limit: number;
  currencyCode: string;
}

interface BudgetProgressBarsProps {
  items: BudgetProgressItem[];
  title?: string;
  description?: string;
}

export function BudgetProgressBars({ items, title, description }: BudgetProgressBarsProps) {
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

  const getProgressConfig = (percentage: number) => {
    if (percentage >= 100) {
      return {
        color: 'bg-gradient-to-r from-red-500 to-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/10',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-700 dark:text-red-400',
        icon: AlertCircle,
        iconColor: 'text-red-500',
        label: 'Over Budget'
      };
    }
    if (percentage >= 80) {
      return {
        color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-700 dark:text-yellow-400',
        icon: AlertTriangle,
        iconColor: 'text-yellow-500',
        label: 'Warning'
      };
    }
    return {
      color: 'bg-gradient-to-r from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/10',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      label: 'On Track'
    };
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            {title || t('charts.budgetProgress')}
          </CardTitle>
          <CardDescription>{description || t('charts.budgetProgressDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Target className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">{t('charts.noLimitsSet')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-500" />
          {title || t('charts.budgetProgress')}
        </CardTitle>
        <CardDescription className="mt-1.5">{description || t('charts.budgetProgressDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => {
            const percentage = item.limit > 0 ? (item.used / item.limit) * 100 : 0;
            const cappedPercentage = Math.min(percentage, 100);
            const config = getProgressConfig(percentage);
            const Icon = config.icon;
            const remaining = item.limit - item.used;
            
            return (
              <div 
                key={item.id} 
                className={cn(
                  "rounded-xl border-2 p-4 transition-all hover:shadow-md",
                  config.bgColor,
                  config.borderColor
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", config.bgColor, config.textColor)}>
                        <Icon className="h-3 w-3" />
                        <span>{config.label}</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {formatAmount(item.used)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {formatAmount(item.limit)} {item.currencyCode}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-2xl font-bold", config.textColor)}>
                      {percentage.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {remaining >= 0 ? (
                        <span>{formatAmount(remaining)} left</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          {formatAmount(Math.abs(remaining))} over
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500 ease-out relative",
                      config.color
                    )}
                    style={{ width: `${cappedPercentage}%` }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                  {/* Overflow indicator */}
                  {percentage > 100 && (
                    <div className="absolute right-0 top-0 h-full w-1 bg-red-600 animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
