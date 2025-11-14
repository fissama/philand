"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Plus, Loader2, TrendingUp, TrendingDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";

const schema = z.object({
  amount: z.number().positive("Amount is required"),
  kind: z.enum(["income", "expense"]),
  occurredOn: z.string().min(1, "Date is required"),
  categoryId: z.string().optional(),
  note: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

const NO_CATEGORY = "__no_category__";

interface QuickAddEntryProps {
  budgetId: string;
  trigger?: React.ReactNode;
  className?: string;
}

export function QuickAddEntry({ budgetId, trigger, className }: QuickAddEntryProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ["categories", budgetId],
    queryFn: () => api.categories.list(budgetId)
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      kind: "expense",
      occurredOn: new Date().toISOString().slice(0, 10),
      categoryId: NO_CATEGORY,
      note: ""
    }
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.entries.create(budgetId, {
        ...values,
        amount: Math.abs(values.amount),
        categoryId: values.categoryId === NO_CATEGORY ? undefined : values.categoryId
      }),
    onSuccess: () => {
      toast.success(t("entry.addEntry"));
      queryClient.invalidateQueries({ queryKey: ["entries", budgetId] });
      queryClient.invalidateQueries({ queryKey: ["budget-balance", budgetId] });
      form.reset({
        amount: 0,
        kind: "expense",
        occurredOn: new Date().toISOString().slice(0, 10),
        categoryId: NO_CATEGORY,
        note: ""
      });
      setOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(t("common.error"), {
        description: error instanceof Error ? error.message : t("common.error")
      });
    }
  });

  const categories = categoriesQuery.data ?? [];
  const selectedKind = form.watch("kind");

  const handleSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const defaultTrigger = (
    <Button className={className} size="sm">
      <Plus className="h-4 w-4 mr-2" />
      {t("entry.addEntry")}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t("entry.addEntry")}
          </DialogTitle>
          <DialogDescription>
            {t("entry.recordTransaction")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("entry.amount")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                      className="text-lg font-medium"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("entry.type")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span>{t("entry.income")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="expense">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <span>{t("entry.expense")}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="occurredOn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("entry.date")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category (Optional) */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("entry.category")} 
                    <span className="text-xs text-muted-foreground ml-1">({t("common.optional")})</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("entry.selectCategory")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_CATEGORY}>
                        <span className="text-muted-foreground">{t("entry.noCategory")}</span>
                      </SelectItem>
                      {categories
                        .filter(cat => cat.kind === selectedKind)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Note (Optional) */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("entry.note")}
                    <span className="text-xs text-muted-foreground ml-1">({t("common.optional")})</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("entry.optionalNote")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("entry.saving")}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("entry.addEntry")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}