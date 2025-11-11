"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { label: "Overview", path: "overview" },
  { label: "Categories", path: "categories" },
  { label: "Entries", path: "entries" },
  { label: "Members", path: "members" },
  { label: "Summary", path: "summary" }
];

export default function BudgetLayout({ children }: PropsWithChildren) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();

  const active = tabs.find((tab) => pathname.endsWith(tab.path))?.path ?? "overview";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Budget</p>
            <h1 className="text-2xl font-bold">{params.id}</h1>
          </div>
          <Tabs value={active} className="w-full sm:w-auto">
            <TabsList className="w-full sm:w-auto">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.path} value={tab.path} asChild>
                  <Link href={`/budgets/${params.id}/${tab.path}`}>{tab.label}</Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
      {children}
    </div>
  );
}
