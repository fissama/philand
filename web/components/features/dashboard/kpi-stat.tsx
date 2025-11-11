import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KPIStatProps {
  label: string;
  value: string;
  trend?: "up" | "down";
  description?: string;
}

export function KPIStat({ label, value, trend, description }: KPIStatProps) {
  return (
    <Card className="rounded-2xl border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {trend === "up" ? <TrendingUp className="h-5 w-5 text-emerald-500" /> : null}
        {trend === "down" ? <TrendingDown className="h-5 w-5 text-rose-500" /> : null}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {description ? <p className="mt-2 text-xs text-muted-foreground">{description}</p> : null}
      </CardContent>
    </Card>
  );
}
