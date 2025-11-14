"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from 'next-intl';
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api, type Entry, type CategoryKind } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

const entryFormSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  kind: z.enum(["income", "expense"] as const),
  categoryId: z.string().optional(),
  occurredOn: z.string().min(1, "Date is required"),
  note: z.string().optional(),
});

type EntryFormData = z.infer<typeof entryFormSchema>;

interface EntryFormProps {
  budgetId?: string;
  entry?: Entry;
  onSubmit: (data: EntryFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  showBudgetSelector?: boolean;
  defaultBudgetId?: string;
  categories?: Array<{ id: string; name: string; kind: CategoryKind }>;
}

const NO_CATEGORY = "__no_category__";

export function EntryForm({
  budgetId,
  entry,
  onSubmit,
  onCancel,
  isLoading = false,
  title,
  description,
  showBudgetSelector = false,
  defaultBudgetId,
  categories: providedCategories
}: EntryFormProps) {
  const t = useTranslations();
  const [selectedKind, setSelectedKind] = useState<CategoryKind>(entry?.kind || "expense");
  const [selectedBudgetId, setSelectedBudgetId] = useState(budgetId || defaultBudgetId || "");

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => api.budgets.list(),
    enabled: showBudgetSelector,
  });

  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ["categories", selectedBudgetId],
    queryFn: () => api.categories.list(selectedBudgetId),
    enabled: Boolean(selectedBudgetId) && !providedCategories,
  });

  const categories = providedCategories || fetchedCategories;

  const form = useForm<EntryFormData>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      amount: entry ? entry.amount_minor / 100 : 0,
      kind: entry?.kind || "expense",
      categoryId: entry?.category_id || NO_CATEGORY,
      occurredOn: entry?.entry_date || new Date().toISOString().slice(0, 10),
      note: entry?.description || "",
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = form;
  const watchedKind = watch("kind");

  useEffect(() => {
    setSelectedKind(watchedKind);
  }, [watchedKind]);

  useEffect(() => {
    if (entry) {
      reset({
        amount: entry.amount_minor / 100,
        kind: entry.kind,
        categoryId: entry.category_id || NO_CATEGORY,
        occurredOn: entry.entry_date,
        note: entry.description || "",
      });
      setSelectedKind(entry.kind);
    }
  }, [entry, reset]);

  const handleKindChange = (kind: CategoryKind) => {
    setSelectedKind(kind);
    setValue("kind", kind);
    setValue("categoryId", NO_CATEGORY);
  };

  const filteredCategories = categories.filter(cat => cat.kind === selectedKind);
  const selectedBudget = budgets.find(b => b.id === selectedBudgetId);

  const onFormSubmit = async (data: EntryFormData) => {
    try {
      const submitData = {
        amount: data.amount,
        occurredOn: data.occurredOn,
        kind: data.kind,
        note: data.note,
        categoryId: data.categoryId === NO_CATEGORY ? undefined : data.categoryId,
      };
      
      if (showBudgetSelector) {
        await onSubmit({ ...submitData, budgetId: selectedBudgetId } as any);
      } else {
        await onSubmit(submitData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-0 sm:border shadow-none sm:shadow-sm">
      <CardHeader className="px-4 sm:px-6 pb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            selectedKind === "income" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          )}>
            {selectedKind === "income" ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl">
              {title || (entry ? t('entry.editEntry') : t('entry.addEntry'))}
            </CardTitle>
            {description && (
              <CardDescription className="text-base mt-1">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {showBudgetSelector && (
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                {t('budget.budget')}
              </Label>
              <Select
                value={selectedBudgetId}
                onValueChange={setSelectedBudgetId}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder={t('budget.selectBudget')} />
                </SelectTrigger>
                <SelectContent>
                  {budgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span>{budget.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({budget.currency_code})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-base font-medium">{t('entry.type')}</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={selectedKind === "income" ? "default" : "outline"}
                className={cn(
                  "h-16 sm:h-14 justify-start gap-3 transition-all text-base font-medium",
                  selectedKind === "income" && "bg-green-600 hover:bg-green-700 text-white"
                )}
                onClick={() => handleKindChange("income")}
              >
                <TrendingUp className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{t('entry.income')}</div>
                  <div className="text-xs opacity-70 hidden sm:block">Money coming in</div>
                </div>
              </Button>
              <Button
                type="button"
                variant={selectedKind === "expense" ? "default" : "outline"}
                className={cn(
                  "h-16 sm:h-14 justify-start gap-3 transition-all text-base font-medium",
                  selectedKind === "expense" && "bg-red-600 hover:bg-red-700 text-white"
                )}
                onClick={() => handleKindChange("expense")}
              >
                <TrendingDown className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{t('entry.expense')}</div>
                  <div className="text-xs opacity-70 hidden sm:block">Money going out</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Amount - Full width on mobile for better visibility */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base font-medium">
              {t('entry.amount')}
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
              className={cn(
                "h-14 text-2xl font-bold text-center sm:text-left sm:h-12 sm:text-lg sm:font-medium",
                errors.amount && "border-red-500"
              )}
            />
            {errors.amount && (
              <p className="text-sm text-red-500 text-center sm:text-left">{errors.amount.message}</p>
            )}
          </div>

          {/* Date - Full width on mobile */}
          <div className="space-y-2">
            <Label className="text-base font-medium">{t('entry.date')}</Label>
            <Input
              type="date"
              {...register("occurredOn")}
              className={cn("h-12 text-base", errors.occurredOn && "border-red-500")}
            />
            {errors.occurredOn && (
              <p className="text-sm text-red-500">{errors.occurredOn.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">
              {t('entry.category')} 
              <span className="text-sm text-muted-foreground ml-1">({t('common.optional')})</span>
            </Label>
            <Select
              value={watch("categoryId")}
              onValueChange={(value) => setValue("categoryId", value)}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder={`Select ${selectedKind} category`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>
                  <span className="text-muted-foreground">{t('entry.noCategory')}</span>
                </SelectItem>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full shrink-0",
                        category.kind === "income" ? "bg-green-500" : "bg-red-500"
                      )} />
                      <span className="truncate">{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-base font-medium">
              {t('entry.note')} 
              <span className="text-sm text-muted-foreground ml-1">({t('common.optional')})</span>
            </Label>
            <Textarea
              id="note"
              {...register("note")}
              placeholder={selectedKind === "income" ? "Salary, freelance work, etc." : "Groceries, gas, restaurant, etc."}
              className="min-h-[80px] resize-none text-base"
              rows={3}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 h-12 text-base font-medium"
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex-1 h-14 sm:h-12 text-base font-bold sm:font-medium",
                selectedKind === "income" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {entry ? "Updating..." : "Creating..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {selectedKind === "income" ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {entry ? t('common.update') : t('common.create')}
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}