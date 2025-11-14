// This file contains the fully translated version
// Copy this content to replace entries/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle } from "lucide-react";
import { useTranslations } from 'next-intl';

import { EntryTable } from "@/components/features/entries/entry-table";
import { DateRangePicker } from "@/components/features/forms/date-range-picker";
import { MoneyInput } from "@/components/features/forms/money-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatMoney } from "@/lib/format";

const schema = z.object({
  amount: z.number().positive("Amount is required"),
  occurredOn: z.string().min(1, "Date is required"),
  kind: z.enum(["income", "expense"]),
  note: z.string().optional(),
  categoryId: z.string().min(1, "Category is required")
});

type FormValues = z.infer<typeof schema>;

type DateRangePreset = "3days" | "7days" | "thisMonth" | "lastMonth" | "custom";

export default function BudgetEntriesPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  // Calculate this month's date range
  const getThisMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      from: firstDay.toISOString().split("T")[0],
      to: lastDay.toISOString().split("T")[0]
    };
  };
  
  const [filters, setFilters] = useState<{ 
    kind?: "income" | "expense" | "all"; 
    categoryId?: string;
    from?: string; 
    to?: string;
    search?: string;
    sortBy?: "date" | "amount" | "description";
    sortOrder?: "asc" | "desc";
    page?: number;
    perPage?: number;
  }>({ 
    kind: "all",
    sortBy: "date",
    sortOrder: "desc",
    page: 1,
    perPage: 30,
    ...getThisMonthRange() // Default to this month
  });
  const [datePreset, setDatePreset] = useState<DateRangePreset>("thisMonth");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const budgetQuery = useQuery({
    queryKey: ["budget", params.id],
    queryFn: () => api.budgets.detail(params.id)
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories", params.id],
    queryFn: () => api.categories.list(params.id)
  });

  const entriesQuery = useQuery({
    queryKey: ["entries", params.id, filters],
    queryFn: () =>
      api.entries.list(params.id, {
        kind: filters.kind && filters.kind !== "all" ? filters.kind : undefined,
        categoryId: filters.categoryId,
        from: filters.from,
        to: filters.to,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: filters.page,
        perPage: filters.perPage
      })
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, occurredOn: new Date().toISOString().slice(0, 10), kind: "expense", categoryId: "" }
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.entries.create(params.id, {
        ...values,
        amount: Math.abs(values.amount)
      }),
    onSuccess: () => {
      toast.success(t('entry.addEntry'));
      queryClient.invalidateQueries({ queryKey: ["entries", params.id] });
      form.reset({ amount: 0, occurredOn: new Date().toISOString().slice(0, 10), kind: "expense", categoryId: "" });
      setDialogOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(t('common.error'), { description: error instanceof Error ? error.message : t('common.error') });
    }
  });

  const categories = categoriesQuery.data ?? [];

  const handleSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  const handleSort = (field: "date" | "amount" | "description") => {
    setFilters((prev) => {
      // If clicking the same field, toggle order
      if (prev.sortBy === field) {
        return { ...prev, sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" };
      }
      // If clicking a new field, set it with default desc order
      return { ...prev, sortBy: field, sortOrder: "desc" };
    });
  };

  const handleDatePreset = (preset: DateRangePreset) => {
    setDatePreset(preset);
    const now = new Date();
    
    switch (preset) {
      case "3days": {
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(now.getDate() - 3);
        setFilters((prev) => ({
          ...prev,
          from: threeDaysAgo.toISOString().split("T")[0],
          to: now.toISOString().split("T")[0]
        }));
        setShowCustomRange(false);
        break;
      }
      case "7days": {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        setFilters((prev) => ({
          ...prev,
          from: sevenDaysAgo.toISOString().split("T")[0],
          to: now.toISOString().split("T")[0]
        }));
        setShowCustomRange(false);
        break;
      }
      case "thisMonth": {
        const range = getThisMonthRange();
        setFilters((prev) => ({ ...prev, ...range }));
        setShowCustomRange(false);
        break;
      }
      case "lastMonth": {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        setFilters((prev) => ({
          ...prev,
          from: firstDay.toISOString().split("T")[0],
          to: lastDay.toISOString().split("T")[0]
        }));
        setShowCustomRange(false);
        break;
      }
      case "custom":
        setShowCustomRange(true);
        break;
    }
  };

  const summary = useMemo(() => {
    // Get currency from budget, fallback to entries, then USD
    const currency = budgetQuery.data?.currency_code || entriesQuery.data?.[0]?.currency_code || "USD";
    
    if (!entriesQuery.data || entriesQuery.data.length === 0) {
      return { 
        income: 0, 
        expense: 0, 
        net: 0,
        currency,
        incomeFormatted: formatMoney(0, currency),
        expenseFormatted: formatMoney(0, currency),
        netFormatted: formatMoney(0, currency)
      };
    }
    
    const income = entriesQuery.data
      .filter((entry) => entry.kind === "income")
      .reduce((sum, entry) => sum + Math.abs(entry.amount_minor / 100), 0);
    const expense = entriesQuery.data
      .filter((entry) => entry.kind === "expense")
      .reduce((sum, entry) => sum + Math.abs(entry.amount_minor / 100), 0);
    
    return { 
      income, 
      expense, 
      net: income - expense,
      currency,
      incomeFormatted: formatMoney(income, currency),
      expenseFormatted: formatMoney(expense, currency),
      netFormatted: formatMoney(income - expense, currency)
    };
  }, [entriesQuery.data, budgetQuery.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('entry.entries')}</h2>
          <p className="text-sm text-muted-foreground">
            {entriesQuery.data?.length ?? 0} {entriesQuery.data?.length === 1 ? t('overview.entry') : t('entry.entries').toLowerCase()}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              {t('entry.addEntry')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('entry.addEntry')}</DialogTitle>
              <DialogDescription>{t('entry.recordTransaction')}</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('entry.amount')}</FormLabel>
                    <FormControl>
                      <MoneyInput
                        {...field}
                        onChange={(event) => {
                          const next = parseFloat(event.target.value);
                          field.onChange(Number.isNaN(next) ? 0 : next);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occurredOn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('entry.date')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('entry.type')}</FormLabel>
                    <FormControl>
                      <select
                        className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...field}
                      >
                        <option value="income">{t('entry.income')}</option>
                        <option value="expense">{t('entry.expense')}</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('entry.category')}</FormLabel>
                    <FormControl>
                      <select
                        className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...field}
                      >
                        <option value="">{t('entry.selectCategory')}</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name} ({category.kind})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('entry.note')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('entry.optionalNote')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <Button type="submit" disabled={mutation.isPending} className="w-full">
                  {mutation.isPending ? t('entry.saving') : t('entry.addEntry')}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{t('entry.filters')}</CardTitle>
            <CardDescription>{t('entry.filterDescription')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <Input
                placeholder="Search by description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="secondary">
                Search
              </Button>
              {filters.search && (
                <Button
                  onClick={() => {
                    setSearchInput("");
                    setFilters((prev) => ({ ...prev, search: undefined, page: 1 }));
                  }}
                  variant="ghost"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="filter-type" className="text-sm font-medium text-muted-foreground">{t('entry.type')}:</label>
                <select
                  id="filter-type"
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={filters.kind || "all"}
                  onChange={(e) => setFilters((prev) => ({ ...prev, kind: e.target.value as "income" | "expense" | "all", page: 1 }))}
                >
                  <option value="all">{t('entry.allTypes')}</option>
                  <option value="income">{t('entry.income')}</option>
                  <option value="expense">{t('entry.expense')}</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="filter-category" className="text-sm font-medium text-muted-foreground">{t('entry.category')}:</label>
                <select
                  id="filter-category"
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={filters.categoryId || "all"}
                  onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value === "all" ? undefined : e.target.value, page: 1 }))}
                >
                  <option value="all">{t('entry.allCategories')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.kind})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="filter-period" className="text-sm font-medium text-muted-foreground">{t('entry.period')}:</label>
                <select
                  id="filter-period"
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={datePreset}
                  onChange={(e) => handleDatePreset(e.target.value as DateRangePreset)}
                >
                  <option value="3days">{t('entry.last3Days')}</option>
                  <option value="7days">{t('entry.last7Days')}</option>
                  <option value="thisMonth">{t('overview.thisMonth')}</option>
                  <option value="lastMonth">{t('overview.lastMonth')}</option>
                  <option value="custom">{t('entry.customRange')}</option>
                </select>
              </div>
              
              {showCustomRange && (
                <DateRangePicker
                  value={{ from: filters.from, to: filters.to }}
                  onChange={(value) => {
                    setFilters((prev) => ({ ...prev, ...value, page: 1 }));
                    setDatePreset("custom");
                  }}
                />
              )}
            </div>


          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('entry.transactions')}</CardTitle>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('entry.income')}: </span>
                <span className="font-semibold text-emerald-600">
                  {summary?.incomeFormatted ?? "0"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('entry.expense')}: </span>
                <span className="font-semibold text-red-600">
                  {summary?.expenseFormatted ?? "0"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('entry.net')}: </span>
                <span className={`font-semibold ${(summary?.net ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {summary?.netFormatted ?? "0"}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <EntryTable 
            entries={entriesQuery.data} 
            loading={entriesQuery.isLoading} 
            categories={categories}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSort={handleSort}
            currency={budgetQuery.data?.currency_code}
            budgetId={params.id}
            onEntryUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ["entries", params.id] });
              queryClient.invalidateQueries({ queryKey: ["budget-balance", params.id] });
            }}
            canEdit={true}
          />
          
          {/* Pagination Controls */}
          {entriesQuery.data && entriesQuery.data.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <label htmlFor="per-page" className="text-sm font-medium text-muted-foreground">
                  Show:
                </label>
                <select
                  id="per-page"
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={filters.perPage || 30}
                  onChange={(e) => setFilters((prev) => ({ ...prev, perPage: Number(e.target.value), page: 1 }))}
                >
                  <option value="10">10</option>
                  <option value="30">30</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-muted-foreground">entries per page</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Page {filters.page || 1} • Showing {entriesQuery.data.length} entries
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                    disabled={!filters.page || filters.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                    disabled={!entriesQuery.data || entriesQuery.data.length < (filters.perPage || 30)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
