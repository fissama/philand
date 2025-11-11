"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/input";

export interface MoneyInputProps extends InputProps {
  currency?: string;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ currency = "$", className, ...props }, ref) => {
    return (
      <div className={cn("flex items-center gap-2 rounded-lg border border-input bg-background px-3", className)}>
        <span className="text-sm font-semibold text-muted-foreground">{currency}</span>
        <Input ref={ref} type="number" step="0.01" className="border-0 px-0 focus-visible:ring-0" {...props} />
      </div>
    );
  }
);
MoneyInput.displayName = "MoneyInput";
