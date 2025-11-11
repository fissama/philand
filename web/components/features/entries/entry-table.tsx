"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Entry } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface EntryTableProps {
  entries?: Entry[];
  loading?: boolean;
}

export function EntryTable({ entries = [], loading }: EntryTableProps) {
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const body = useMemo(() => {
    if (loading) {
      return (
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      );
    }

    if (!entries.length) {
      return <p className="text-sm text-muted-foreground">No transactions yet.</p>;
    }

    return (
      <div className="space-y-2">
        <div className="hidden rounded-xl border border-border bg-muted/40 p-4 text-xs font-semibold uppercase text-muted-foreground md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-4">
          <span>Note</span>
          <span>Category</span>
          <span>Kind</span>
          <span>Amount</span>
        </div>
        {entries.map((entry) => (
          <Card key={entry.id} className="border-border">
            <CardContent className="grid gap-2 p-4 md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center">
              <div>
                <p className="font-medium">{entry.note ?? "No note"}</p>
                <p className="text-xs text-muted-foreground">{new Date(entry.occurredOn).toLocaleDateString()}</p>
              </div>
              <span className="text-sm text-muted-foreground">{entry.category?.name ?? "Uncategorised"}</span>
              <span className={cn("text-sm font-semibold", entry.kind === "income" ? "text-emerald-500" : "text-rose-500")}>{
                entry.kind === "income" ? "Income" : "Expense"
              }</span>
              <div className="text-right text-sm font-semibold">
                {entry.kind === "income" ? "+" : "-"}
                {Math.abs(entry.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between md:hidden">
                <Button variant="ghost" size="sm" onClick={() => toggleRow(entry.id)} className="mt-2">
                  Details
                  <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", openRows[entry.id] && "rotate-180")}
                  />
                </Button>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {entry.category?.name ?? "Uncategorised"}
                </span>
              </div>
              {openRows[entry.id] ? (
                <div className="md:hidden">
                  <p className="text-xs text-muted-foreground">Type: {entry.kind}</p>
                  <p className="text-xs text-muted-foreground">Amount: {entry.amount}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [entries, loading, openRows]);

  return <div>{body}</div>;
}
