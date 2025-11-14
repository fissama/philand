"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle, Search, X, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/hooks/use-debounce";

import { BudgetCard } from "@/components/features/budgets/budget-card";
import { GlobalQuickAddEntry } from "@/components/features/entries/global-quick-add-entry";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { toast } from "sonner";

const budgetSchema = z.object({
  name: z.string().min(2, "Name is required"),
  currency: z.string().min(1, "Currency is required")
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export default function BudgetsPage() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const budgetsQuery = useQuery({ 
    queryKey: ["budgets", debouncedSearchTerm], 
    queryFn: () => api.budgets.list(debouncedSearchTerm || undefined)
  });

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { name: "", currency: "USD" }
  });

  const mutation = useMutation({
    mutationFn: api.budgets.create,
    onSuccess: (data) => {
      toast.success("Budget created", { description: `${data.name} is ready!` });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setShowForm(false);
      form.reset();
    },
    onError: (error: unknown) => {
      toast.error("Failed to create budget", { description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const onSubmit = (values: BudgetFormValues) => {
    mutation.mutate(values);
  };

  const filteredBudgets = useMemo(() => {
    if (!budgetsQuery.data) return [];
    return budgetsQuery.data;
  }, [budgetsQuery.data]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('budget.budgets')}</h1>
          <p className="text-sm text-muted-foreground">{t('budget.manageBudget')}</p>
        </div>
        <div className="flex gap-2">
          <GlobalQuickAddEntry 
            trigger={
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                {t('entry.addEntry')}
              </Button>
            }
          />
          <Button onClick={() => setShowForm((prev) => !prev)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {showForm ? t('common.close') : t('budget.createBudget')}
          </Button>
        </div>
      </header>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('budget.searchBudgets')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-muted-foreground">
              {budgetsQuery.isLoading 
                ? t('common.loading')
                : `${filteredBudgets.length} ${t('budget.budgetsFound')}`
              }
            </p>
          )}
        </CardContent>
      </Card>

      {showForm ? (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Create budget</CardTitle>
            <CardDescription>Set up a new envelope for your team.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Marketing Q3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input placeholder="USD" maxLength={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Creating..." : "Create budget"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : null}

      {budgetsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : filteredBudgets.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredBudgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      ) : searchTerm ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('budget.noBudgetsFound')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('budget.noResultsFor')} "{searchTerm}"
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="mt-4"
            >
              {t('common.clearSearch')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.noBudgets')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('dashboard.noBudgetsDescription')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
