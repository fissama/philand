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
import { TransferDialog } from "@/components/features/transfers/transfer-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { budgetTypes } from "@/lib/budget-types";
import { toast } from "sonner";

const budgetSchema = z.object({
  name: z.string().min(2, "Name is required"),
  currency: z.string().min(1, "Currency is required"),
  budget_type: z.enum(["standard", "saving", "debt", "invest", "sharing"]).optional(),
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
    defaultValues: { name: "", currency: "USD", budget_type: "standard" }
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
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Mobile-optimized header */}
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t('budget.budgets')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('budget.manageBudget')}</p>
          </div>
        </div>

        {/* Mobile: Action buttons in grid */}
        <div className="grid grid-cols-2 gap-2 md:hidden">
          <GlobalQuickAddEntry 
            trigger={
              <Button variant="outline" className="w-full h-11 gap-2">
                <Plus className="h-4 w-4" />
                <span className="text-sm">{t('entry.addEntry')}</span>
              </Button>
            }
          />
          <TransferDialog 
            trigger={
              <Button variant="outline" className="w-full h-11 gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 7h10v5"/>
                  <path d="M7 7v10"/>
                  <path d="m7 17 10-10"/>
                </svg>
                <span className="text-sm">Transfer</span>
              </Button>
            }
          />
          <Button 
            onClick={() => setShowForm((prev) => !prev)} 
            className="col-span-2 h-11 gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="text-sm">{showForm ? t('common.close') : t('budget.createBudget')}</span>
          </Button>
        </div>

        {/* Desktop: Action buttons in row */}
        <div className="hidden md:flex gap-2 justify-end">
          <GlobalQuickAddEntry 
            trigger={
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                {t('entry.addEntry')}
              </Button>
            }
          />
          <TransferDialog />
          <Button onClick={() => setShowForm((prev) => !prev)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {showForm ? t('common.close') : t('budget.createBudget')}
          </Button>
        </div>
      </header>

      {/* Search Bar - Simplified for mobile */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          placeholder={t('budget.searchBudgets')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 h-11 md:h-10"
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
        <p className="text-sm text-muted-foreground px-1">
          {budgetsQuery.isLoading 
            ? t('common.loading')
            : `${filteredBudgets.length} ${t('budget.budgetsFound')}`
          }
        </p>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{t('budget.createBudget')}</DialogTitle>
            <DialogDescription className="text-sm">
              {t('budget.budgetDetails')}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="grid gap-4 mt-2" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('budget.name')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Marketing Q3" 
                        className="h-11 md:h-10" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="budget_type"
                render={({ field }) => {
                  const selectedType = budgetTypes.find(t => t.value === field.value);
                  const SelectedIcon = selectedType?.icon;
                  
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">{t('budget.type')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-auto min-h-[44px] md:min-h-[40px]">
                            <SelectValue>
                              {selectedType && (
                                <div className="flex items-center gap-2 md:gap-3 py-1">
                                  <div className={`rounded-lg p-1.5 md:p-2 ${selectedType.bgColor} ${selectedType.borderColor} border`}>
                                    {SelectedIcon && <SelectedIcon className={`h-4 w-4 md:h-5 md:w-5 ${selectedType.color}`} />}
                                  </div>
                                  <div className="flex flex-col items-start">
                                    <span className="text-sm font-semibold">{t(selectedType.labelKey as any)}</span>
                                    <span className="text-xs text-muted-foreground line-clamp-1">
                                      {t(selectedType.descriptionKey as any)}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {budgetTypes.map((type) => {
                            const TypeIcon = type.icon;
                            return (
                              <SelectItem key={type.value} value={type.value} className="cursor-pointer">
                                <div className="flex items-center gap-2 md:gap-3 py-2">
                                  <div className={`rounded-lg p-1.5 md:p-2 ${type.bgColor} ${type.borderColor} border`}>
                                    <TypeIcon className={`h-4 w-4 md:h-5 md:w-5 ${type.color}`} />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{t(type.labelKey as any)}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {t(type.descriptionKey as any)}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('budget.currency')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="USD" 
                        maxLength={3} 
                        className="h-11 md:h-10 uppercase" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col-reverse md:flex-row gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-11 md:h-10"
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-11 md:h-10" 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? t('common.loading') : t('budget.createBudget')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {budgetsQuery.isLoading ? (
        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 md:h-48 rounded-xl md:rounded-2xl" />
          ))}
        </div>
      ) : filteredBudgets.length ? (
        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filteredBudgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      ) : searchTerm ? (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('budget.noBudgetsFound')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('budget.noResultsFor')} "{searchTerm}"
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="w-full md:w-auto"
            >
              {t('common.clearSearch')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('dashboard.noBudgets')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('dashboard.noBudgetsDescription')}</p>
            <Button
              onClick={() => setShowForm(true)}
              className="w-full md:w-auto mt-4 gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              {t('budget.createBudget')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
