"use client";

import { useParams, usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/navigation";
import { useTranslations } from 'next-intl';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react";

import { useBudgetPermissions } from "@/lib/useBudgetPermissions";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuickAddEntry } from "@/components/features/entries/quick-add-entry";
import { api } from "@/lib/api";
import { formatMoneyWithSign, formatMoney } from "@/lib/format";

// Tabs will be translated in the component

export default function BudgetLayout({ children }: PropsWithChildren) {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const { permissions, tabPermissions, isContributor } = useBudgetPermissions(params.id);

  // Filter tabs based on user permissions
  const allTabs = [
    { label: t('overview.title'), path: "overview", allowed: tabPermissions.overview },
    { label: t('category.categories'), path: "categories", allowed: tabPermissions.categories },
    { label: t('entry.entries'), path: "entries", allowed: tabPermissions.entries },
    { label: t('members.title'), path: "members", allowed: tabPermissions.members },
    { label: t('summary.title'), path: "summary", allowed: tabPermissions.summary },
    { label: t('settings.title'), path: "settings", allowed: tabPermissions.settings }
  ];

  const tabs = allTabs.filter(tab => tab.allowed);

  const budgetQuery = useQuery({
    queryKey: ["budget", params.id],
    queryFn: () => api.budgets.detail(params.id)
  });

  // Fetch budget balance
  const balanceQuery = useQuery({
    queryKey: ["budget-balance", params.id],
    queryFn: () => api.budgets.balance(params.id),
    select: (data) => ({
      income: data.income / 100,
      expense: data.expense / 100,
      net: data.net / 100,
      currency: data.currency_code
    })
  });

  const active = tabs.find((tab) => pathname.endsWith(tab.path))?.path ?? "overview";

  return (
    <div className="space-y-6">
      {/* Header with Back Button and Budget Info */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Link href="/budgets">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wallet className="h-4 w-4" />
          <span>{t('budget.budgets')}</span>
        </div>
      </div>

      {/* Enhanced Budget Header */}
      <div className="rounded-2xl bg-gradient-to-br from-card to-card/50 p-6 shadow-sm border">
        <div className="flex flex-col gap-6">
          {/* Budget Title, Quick Add Button, and Net Balance */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs uppercase text-muted-foreground font-medium tracking-wider">
                {t('budget.title')}
              </p>
              {budgetQuery.isLoading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                <h1 className="text-3xl font-bold tracking-tight">
                  {budgetQuery.data?.name ?? "Loading..."}
                </h1>
              )}
              {budgetQuery.data?.description && (
                <p className="text-muted-foreground max-w-md">
                  {budgetQuery.data.description}
                </p>
              )}
            </div>
            
            {/* Enhanced Net Balance Display */}
            <div className="flex flex-col items-start lg:items-end">
              <p className="text-xs uppercase text-muted-foreground font-medium tracking-wider mb-2">
                {t('overview.netBalance')}
              </p>
              {balanceQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ) : balanceQuery.data ? (
                <div className="space-y-3">
                  {/* Main Net Balance */}
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${
                      balanceQuery.data.net >= 0 
                        ? "bg-emerald-100 dark:bg-emerald-900/20" 
                        : "bg-red-100 dark:bg-red-900/20"
                    }`}>
                      {balanceQuery.data.net >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <p className={`text-3xl font-bold ${
                      balanceQuery.data.net >= 0 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {formatMoneyWithSign(balanceQuery.data.net, balanceQuery.data.currency)}
                    </p>
                  </div>
                  
                  {/* Income and Expense Breakdown */}
                  <div className="grid grid-cols-2 gap-4 min-w-[280px]">
                    <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            {t('entry.income')}
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatMoney(balanceQuery.data.income, balanceQuery.data.currency)}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                          <span className="text-xs font-medium text-red-700 dark:text-red-300">
                            {t('entry.expense')}
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                          {formatMoney(balanceQuery.data.expense, balanceQuery.data.currency)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-muted">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold text-muted-foreground">0.00</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="-mx-6 overflow-x-auto px-6 scrollbar-hide sm:mx-0 sm:px-0">
            <Tabs value={active} className="w-full">
              <TabsList className="inline-flex h-auto w-auto gap-1 bg-transparent p-0 sm:w-full sm:justify-start">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.path}
                    value={tab.path}
                    asChild
                    className="whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <Link href={`/budgets/${params.id}/${tab.path}`}>{tab.label}</Link>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      {children}
      
      {/* Floating Action Button for Mobile */}
      {permissions.canAddEntries && (
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <QuickAddEntry
            budgetId={params.id}
            trigger={
              <Button size="lg" className="h-14 w-14 rounded-full shadow-lg">
                <Plus className="h-6 w-6" />
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
