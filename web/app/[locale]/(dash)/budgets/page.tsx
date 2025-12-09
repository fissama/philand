"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle, Search, X, Plus, Archive, ArchiveRestore } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const budgetsQuery = useQuery({ 
    queryKey: ["budgets", debouncedSearchTerm], 
    queryFn: () => api.budgets.list(debouncedSearchTerm || undefined)
  });

  const restoreMutation = useMutation({
    mutationFn: (budgetId: string) => api.budgets.update(budgetId, { archived: false }),
    onSuccess: (data) => {
      toast.success(t('budget.budgetRestored'), { description: `${data.name} ${t('budget.restoredSuccess')}` });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: (error: unknown) => {
      toast.error(t('budget.restoreFailed'), { description: error instanceof Error ? error.message : t('common.error') });
    }
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

  const { activeBudgets, archivedBudgets, currentBudgets } = useMemo(() => {
    if (!budgetsQuery.data) return { activeBudgets: [], archivedBudgets: [], currentBudgets: [] };
    
    const active = budgetsQuery.data.filter(b => !b.archived);
    const archived = budgetsQuery.data.filter(b => b.archived);
    const current = activeTab === "active" ? active : archived;
    
    return { activeBudgets: active, archivedBudgets: archived, currentBudgets: current };
  }, [budgetsQuery.data, activeTab]);

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

      {/* Tabs for Active/Archived with improved styling */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "archived")} className="w-full">
        <div className="flex items-center justify-between gap-4 mb-4">
          <TabsList className="grid grid-cols-2 h-11 md:h-10 flex-1 max-w-md">
            <TabsTrigger value="active" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <span>{t('budget.active')}</span>
              {activeBudgets.length > 0 && (
                <span className="ml-1 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs font-semibold">
                  {activeBudgets.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Archive className="h-4 w-4" />
              <span>{t('budget.archived')}</span>
              {archivedBudgets.length > 0 && (
                <span className="ml-1 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs font-semibold">
                  {archivedBudgets.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Results count */}
          {!budgetsQuery.isLoading && (
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{currentBudgets.length}</span>
              <span>{activeTab === "active" ? t('budget.active') : t('budget.archived')}</span>
            </div>
          )}
        </div>

        {/* Search Bar - Simplified for mobile */}
        <div className="relative mt-4">
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
          <p className="text-sm text-muted-foreground px-1 mt-2">
            {budgetsQuery.isLoading 
              ? t('common.loading')
              : `${currentBudgets.length} ${t('budget.budgetsFound')}`
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

        <TabsContent value="active" className="mt-0 space-y-4">
          {budgetsQuery.isLoading ? (
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={`skeleton-${index}`} className="h-40 md:h-48 rounded-xl md:rounded-2xl" />
              ))}
            </div>
          ) : currentBudgets.length > 0 ? (
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {currentBudgets.map((budget, index) => (
                <div 
                  key={budget.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <BudgetCard budget={budget} />
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <Card className="border-dashed border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  {t('budget.noBudgetsFound')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('budget.noResultsFor')} <span className="font-medium">"{searchTerm}"</span>
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="w-full md:w-auto gap-2"
                >
                  <X className="h-4 w-4" />
                  {t('common.clearSearch')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-muted-foreground" />
                  {t('dashboard.noBudgets')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t('dashboard.noBudgetsDescription')}</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="w-full md:w-auto gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  {t('budget.createBudget')}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="archived" className="mt-0 space-y-4">
          {budgetsQuery.isLoading ? (
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`skeleton-${index}`} className="h-40 md:h-48 rounded-xl md:rounded-2xl" />
              ))}
            </div>
          ) : currentBudgets.length > 0 ? (
            <div className="space-y-4">
              {/* Info banner with improved design */}
              <div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 p-4 md:p-5 border border-muted/50 backdrop-blur-sm">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="rounded-lg bg-background/80 p-2 md:p-2.5 shadow-sm">
                    <Archive className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-sm md:text-base">{t('budget.archivedBudgetsInfo')}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {t('budget.archivedBudgetsDescription')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Archived budgets grid with improved cards */}
              <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {currentBudgets.map((budget, index) => (
                  <div 
                    key={budget.id} 
                    className="relative group animate-in fade-in slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card className="relative overflow-hidden border-muted/50 bg-muted/20 transition-all hover:border-muted hover:shadow-md">
                      {/* Archived badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <div className="flex items-center gap-1.5 rounded-full bg-muted/80 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-muted-foreground border border-muted">
                          <Archive className="h-3 w-3" />
                          <span>{t('budget.archived')}</span>
                        </div>
                      </div>
                      
                      {/* Restore button with improved styling */}
                      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => restoreMutation.mutate(budget.id)}
                          disabled={restoreMutation.isPending}
                          className="gap-2 h-8 shadow-lg hover:shadow-xl transition-all"
                        >
                          <ArchiveRestore className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">{t('budget.restore')}</span>
                        </Button>
                      </div>
                      
                      {/* Budget card with reduced opacity */}
                      <div className="opacity-70 group-hover:opacity-80 transition-opacity pointer-events-none">
                        <BudgetCard budget={budget} />
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ) : searchTerm ? (
            <Card className="border-dashed border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  {t('budget.noArchivedBudgetsFound')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('budget.noResultsFor')} <span className="font-medium">"{searchTerm}"</span>
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="w-full md:w-auto gap-2"
                >
                  <X className="h-4 w-4" />
                  {t('common.clearSearch')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Archive className="h-5 w-5 text-muted-foreground" />
                  {t('budget.noArchivedBudgets')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t('budget.noArchivedBudgetsDescription')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
