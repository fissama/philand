"use client";

import Link from "next/link";
import { ArrowRight, BanknoteIcon } from "lucide-react";

import type { BudgetSummary } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BudgetCardProps {
  budget: BudgetSummary;
}

export function BudgetCard({ budget }: BudgetCardProps) {
  return (
    <Card className="flex flex-col justify-between border-none bg-gradient-to-br from-primary/10 via-background to-background shadow-lg">
      <CardHeader>
        <CardDescription className="uppercase tracking-wide text-xs text-muted-foreground">
          {budget.currency}
        </CardDescription>
        <CardTitle>{budget.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Owner</p>
            <p className="font-semibold">{budget.owner}</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BanknoteIcon className="h-5 w-5" />
            <span>Total Income</span>
          </div>
          <div className="text-emerald-500 font-semibold">
            {budget.totalIncome.toLocaleString(undefined, { style: "currency", currency: budget.currency })}
          </div>
          <div className="text-rose-500 font-semibold">
            -{budget.totalExpense.toLocaleString(undefined, { style: "currency", currency: budget.currency })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Link href={`/budgets/${budget.id}`} className="text-sm font-semibold text-primary">
          View details
        </Link>
        <Button asChild variant="ghost" size="icon">
          <Link href={`/budgets/${budget.id}`}>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
