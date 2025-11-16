"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2, Plus, TrendingUp, TrendingDown, Palette, Grid3X3, Eye, EyeOff } from "lucide-react";

import { CategoryList } from "@/components/features/categories/category-list";
import { CategoryForm } from "@/components/features/categories/category-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useBudgetPermissions } from "@/lib/useBudgetPermissions";
import { toast } from "sonner";

export default function BudgetCategoriesPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { permissions } = useBudgetPermissions(params.id);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const categoriesQuery = useQuery({
    queryKey: ["categories", params.id],
    queryFn: () => api.categories.list(params.id)
  });

  const mutation = useMutation({
    mutationFn: (values: any) => api.categories.create(params.id, values),
    onSuccess: () => {
      toast.success(t("category.categoryCreated"));
      queryClient.invalidateQueries({ queryKey: ["categories", params.id] });
      setShowCreateDialog(false);
    },
    onError: (error: unknown) => {
      toast.error(t("common.error"), { 
        description: error instanceof Error ? error.message : t("common.error") 
      });
    }
  });

  const handleCategoryUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["categories", params.id] });
  };

  const handleFormSubmit = async (data: any) => {
    await mutation.mutateAsync(data);
  };

  const allCategories = categoriesQuery.data ?? [];
  const incomeCategories = allCategories.filter(cat => cat.kind === "income" && !cat.is_hidden);
  const expenseCategories = allCategories.filter(cat => cat.kind === "expense" && !cat.is_hidden);
  const hiddenCategories = allCategories.filter(cat => cat.is_hidden);

  const getFilteredCategories = () => {
    switch (activeTab) {
      case "income":
        return incomeCategories;
      case "expense":
        return expenseCategories;
      case "hidden":
        return hiddenCategories;
      default:
        return allCategories.filter(cat => !cat.is_hidden);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Grid3X3 className="h-6 w-6" />
            </div>
            {t("category.categories")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("category.helpOrganized")}
          </p>
        </div>

        {permissions.canManageCategories && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 shadow-lg">
                <Plus className="h-5 w-5" />
                {t("category.createCategory")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
              <DialogHeader className="sr-only">
                <DialogTitle>{t("category.createCategory")}</DialogTitle>
                <DialogDescription>
                  {t("category.addNewCategory")}
                </DialogDescription>
              </DialogHeader>
              <CategoryForm
                onSubmit={handleFormSubmit}
                onCancel={() => setShowCreateDialog(false)}
                isLoading={mutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  {t("entry.income")} {t("category.categories")}
                </p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {incomeCategories.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  {t("entry.expense")} {t("category.categories")}
                </p>
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                  {expenseCategories.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Palette className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  {t("common.total")} {t("category.categories")}
                </p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  {allCategories.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {hiddenCategories.length > 0 && (
          <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-900/30">
                  <EyeOff className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("category.hidden")} {t("category.categories")}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {hiddenCategories.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Categories Section */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t("category.manageCategories")}
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {getFilteredCategories().length} {activeTab === "all" ? t("common.total") : activeTab}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
                <TabsTrigger value="all" className="gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  {t("common.all")}
                </TabsTrigger>
                <TabsTrigger value="income" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t("entry.income")}
                </TabsTrigger>
                <TabsTrigger value="expense" className="gap-2">
                  <TrendingDown className="h-4 w-4" />
                  {t("entry.expense")}
                </TabsTrigger>
                {hiddenCategories.length > 0 && permissions.canManageCategories && (
                  <TabsTrigger value="hidden" className="gap-2">
                    <EyeOff className="h-4 w-4" />
                    {t("category.hidden")}
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="p-6">
              {categoriesQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-lg">{t("common.loading")}</span>
                  </div>
                </div>
              ) : (
                <TabsContent value={activeTab} className="mt-0">
                  <CategoryList 
                    categories={getFilteredCategories()} 
                    emptyMessage={t("category.noCategories")}
                    budgetId={params.id}
                    canEdit={permissions.canManageCategories}
                    onCategoryUpdate={handleCategoryUpdate}
                    viewMode={activeTab}
                  />
                </TabsContent>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* No Permission Message */}
      {!permissions.canManageCategories && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Eye className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  {t("category.viewOnlyMode")}
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t("category.onlyManagers")} {t("category.contactOwner")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}