"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";

import { CategoryList } from "@/components/features/categories/category-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { useBudgetRole } from "@/lib/useBudgetRole";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  kind: z.enum(["income", "expense"])
});

type FormValues = z.infer<typeof schema>;

export default function BudgetCategoriesPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { isManager } = useBudgetRole(params.id);

  const categoriesQuery = useQuery({
    queryKey: ["categories", params.id],
    queryFn: () => api.categories.list(params.id)
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", kind: "expense" }
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => api.categories.create(params.id, values),
    onSuccess: () => {
      toast.success(t("category.createCategory"));
      queryClient.invalidateQueries({ queryKey: ["categories", params.id] });
      form.reset();
    },
    onError: (error: unknown) => {
      toast.error(t("common.error"), { 
        description: error instanceof Error ? error.message : t("common.error") 
      });
    }
  });

  const incomeCategories = categoriesQuery.data?.filter(cat => cat.kind === "income") ?? [];
  const expenseCategories = categoriesQuery.data?.filter(cat => cat.kind === "expense") ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("category.categories")}</h2>
          <p className="text-muted-foreground">
            {t("category.helpOrganized")}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span>{incomeCategories.length} {t("entry.income")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span>{expenseCategories.length} {t("entry.expense")}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {categoriesQuery.isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("common.loading")}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <CategoryList 
              categories={categoriesQuery.data ?? []} 
              emptyMessage={t("category.noCategories")}
            />
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t("category.createCategory")}
            </CardTitle>
            <CardDescription>
              {t("category.addNewCategory")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isManager ? (
              <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("budget.name")}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t("category.mediaSpend")} 
                            {...field} 
                            className="transition-all focus:ring-2 focus:ring-primary/20"
                          />
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
                        <FormLabel>{t("entry.type")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("category.selectType")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="income">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                {t("entry.income")}
                              </div>
                            </SelectItem>
                            <SelectItem value="expense">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                {t("entry.expense")}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="w-full"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common.loading")}
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {t("category.createCategory")}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">
                  {t("category.onlyManagers")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("category.contactOwner")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
