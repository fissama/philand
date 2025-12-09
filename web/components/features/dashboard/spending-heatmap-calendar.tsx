"use client";

import { useTranslations } from "next-intl";
import { Calendar, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DayData {
  date: string;
  amount: number;
}

interface SpendingHeatmapCalendarProps {
  data: DayData[];
  currencyCode: string;
  month?: string; // YYYY-MM format
}

export function SpendingHeatmapCalendar({ data, currencyCode, month }: SpendingHeatmapCalendarProps) {
  const t = useTranslations();

  // Parse month or use current
  const targetDate = month ? new Date(month) : new Date();
  const year = targetDate.getFullYear();
  const monthIndex = targetDate.getMonth();

  // Get calendar data
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Calculate max amount for color intensity
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  // Create lookup map
  const dataMap = new Map(data.map((d) => [d.date, d.amount]));

  // Get color intensity based on amount
  const getIntensityColor = (amount: number) => {
    if (amount === 0) return "bg-muted/30";
    const intensity = amount / maxAmount;
    if (intensity > 0.8) return "bg-red-500";
    if (intensity > 0.6) return "bg-orange-500";
    if (intensity > 0.4) return "bg-yellow-500";
    if (intensity > 0.2) return "bg-emerald-500";
    return "bg-emerald-300";
  };

  const formatAmount = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  // Build calendar grid
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = new Array(7).fill(null);
  
  // Fill first week with nulls before first day
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek[i] = null;
  }

  // Fill in the days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = (startDayOfWeek + day - 1) % 7;
    currentWeek[dayOfWeek] = day;

    if (dayOfWeek === 6 || day === daysInMonth) {
      weeks.push([...currentWeek]);
      currentWeek = new Array(7).fill(null);
    }
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthName = targetDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // Calculate insights
  const totalSpending = data.reduce((sum, d) => sum + d.amount, 0);
  const avgDaily = totalSpending / daysInMonth;
  const maxDay = data.reduce((max, d) => (d.amount > max.amount ? d : max), data[0] || { date: "", amount: 0 });

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            {t("charts.spendingHeatmap")}
          </CardTitle>
          <CardDescription>{t("charts.spendingHeatmapDescription")}</CardDescription>
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
              <Calendar className="h-5 w-5 text-purple-500" />
              {t("charts.spendingHeatmap")}
            </CardTitle>
            <CardDescription className="mt-1.5">{monthName}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatAmount(totalSpending)}</div>
            <div className="text-xs text-muted-foreground">{currencyCode}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {/* Insights */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">{t("charts.avgDaily")}</p>
            <p className="text-lg font-bold">{formatAmount(avgDaily)} {currencyCode}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">{t("charts.highestDay")}</p>
            <p className="text-lg font-bold">
              {maxDay.date ? new Date(maxDay.date).getDate() : "-"}
              <span className="text-sm font-normal ml-1">({formatAmount(maxDay.amount)})</span>
            </p>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="space-y-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIdx) => {
                  if (day === null) {
                    return <div key={dayIdx} className="aspect-square" />;
                  }

                  const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const amount = dataMap.get(dateStr) || 0;
                  const intensityColor = getIntensityColor(amount);

                  return (
                    <div
                      key={dayIdx}
                      className={cn(
                        "aspect-square rounded-md flex flex-col items-center justify-center relative group cursor-pointer transition-all hover:scale-110 hover:z-10",
                        intensityColor,
                        amount > 0 ? "hover:ring-2 hover:ring-primary" : ""
                      )}
                    >
                      <span className="text-xs font-semibold text-white drop-shadow-md">{day}</span>
                      
                      {/* Tooltip */}
                      {amount > 0 && (
                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-20">
                          <div className="bg-background/95 backdrop-blur-sm border-2 rounded-lg p-2 shadow-xl whitespace-nowrap">
                            <p className="text-xs font-semibold">{new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
                            <p className="text-sm font-bold text-red-600">
                              {amount.toLocaleString()} {currencyCode}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <span className="text-xs text-muted-foreground">{t("charts.less")}</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-muted/30" />
            <div className="w-4 h-4 rounded bg-emerald-300" />
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <div className="w-4 h-4 rounded bg-orange-500" />
            <div className="w-4 h-4 rounded bg-red-500" />
          </div>
          <span className="text-xs text-muted-foreground">{t("charts.more")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
