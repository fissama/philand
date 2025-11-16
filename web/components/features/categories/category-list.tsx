import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, FolderOpen, MoreVertical, Edit, Trash2, Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CategorySummary } from "@/lib/api";
import { CategoryForm } from "./category-form";
import { CategoryIcon } from "./category-icon";

interface CategoryListProps {
  categories: CategorySummary[];
  emptyMessage?: string;
  budgetId: string;
  canEdit?: boolean;
  onCategoryUpdate?: () => void;
  viewMode?: string;
  sortBy?: "name" | "kind" | "hidden";
  sortOrder?: "asc" | "desc";
  onSort?: (field: "name" | "kind" | "hidden") => void;
}

export function CategoryList({ 
  categories, 
  emptyMessage = "No categories yet.", 
  budgetId,
  canEdit = false,
  onCategoryUpdate,
  viewMode = "all",
  sortBy,
  sortOrder,
  onSort
}: CategoryListProps) {
  const t = useTranslations();
  const [editingCategory, setEditingCategory] = useState<CategorySummary | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategorySummary | null>(null);
  
  const updateMutation = useMutation({
    mutationFn: (data: any) => api.categories.update(budgetId, editingCategory!.id, data),
    onSuccess: () => {
      toast.success(t('category.categoryUpdated'));
      setEditingCategory(null);
      onCategoryUpdate?.();
    },
    onError: (error) => {
      console.error("Failed to update category:", error);
      toast.error(t('common.error'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.categories.delete(budgetId, deletingCategory!.id),
    onSuccess: () => {
      toast.success(t('category.categoryDeleted'));
      setDeletingCategory(null);
      onCategoryUpdate?.();
    },
    onError: (error) => {
      console.error("Failed to delete category:", error);
      toast.error(t('common.error'));
    },
  });

  const handleEdit = (category: CategorySummary) => {
    setEditingCategory(category);
  };

  const handleDelete = (category: CategorySummary) => {
    if (window.confirm(t('category.confirmDelete'))) {
      deleteMutation.mutate();
    }
  };

  const handleUpdate = async (data: any) => {
    await updateMutation.mutateAsync(data);
  };

  const SortIcon = ({ field }: { field: "name" | "kind" | "hidden" }) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortOrder === "asc" 
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  if (!categories.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          {viewMode === "hidden" ? t('category.noHiddenCategories') : t('category.noCategories')}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-left text-xs font-semibold uppercase text-muted-foreground w-12">
                {t('category.icon')}
              </th>
              <th 
                className="pb-3 text-left text-xs font-semibold uppercase text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => onSort?.("name")}
              >
                <div className="flex items-center">
                  {t('category.name')}
                  <SortIcon field="name" />
                </div>
              </th>
              <th 
                className="pb-3 text-center text-xs font-semibold uppercase text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => onSort?.("kind")}
              >
                <div className="flex items-center justify-center">
                  {t('entry.type')}
                  <SortIcon field="kind" />
                </div>
              </th>
              <th className="pb-3 text-center text-xs font-semibold uppercase text-muted-foreground w-24">
                {t('category.color')}
              </th>
              <th 
                className="pb-3 text-center text-xs font-semibold uppercase text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-24"
                onClick={() => onSort?.("hidden")}
              >
                <div className="flex items-center justify-center">
                  {t('common.status')}
                  <SortIcon field="hidden" />
                </div>
              </th>
              {canEdit && (
                <th className="pb-3 text-right text-xs font-semibold uppercase text-muted-foreground w-12">
                  {t('common.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr 
                key={category.id} 
                className={cn(
                  "border-b border-border/50 hover:bg-muted/30 transition-colors group",
                  category.is_hidden && "opacity-60"
                )}
              >
                <td className="py-4">
                  <div 
                    className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
                    style={{ 
                      backgroundColor: `${category.color || '#6B7280'}20`,
                      color: category.color || '#6B7280'
                    }}
                  >
                    <CategoryIcon 
                      icon={category.icon} 
                      color={category.color} 
                      size={22} 
                    />
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-semibold">{category.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {category.icon || 'No icon'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm",
                    category.kind === "income" 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {category.kind === "income" ? (
                      <><TrendingUp className="h-3.5 w-3.5 mr-1.5" />{t('entry.income')}</>
                    ) : (
                      <><TrendingDown className="h-3.5 w-3.5 mr-1.5" />{t('entry.expense')}</>
                    )}
                  </span>
                </td>
                <td className="py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div 
                      className="w-7 h-7 rounded-lg border-2 border-background shadow-sm ring-1 ring-black/5"
                      style={{ backgroundColor: category.color || '#6B7280' }}
                      title={category.color || '#6B7280'}
                    />
                    <span className="text-xs font-mono text-muted-foreground hidden lg:inline">
                      {category.color || '#6B7280'}
                    </span>
                  </div>
                </td>
                <td className="py-4 text-center">
                  {category.is_hidden ? (
                    <Badge variant="outline" className="text-xs font-medium">
                      <EyeOff className="h-3 w-3 mr-1" />
                      {t('category.hidden')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs font-medium bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                      <Eye className="h-3 w-3 mr-1" />
                      {t('category.visible')}
                    </Badge>
                  )}
                </td>
                {canEdit && (
                  <td className="py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingCategory(category)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {categories.map((category) => (
          <Card 
            key={category.id}
            className={cn(
              "border-border transition-all hover:shadow-md",
              category.is_hidden && "opacity-60"
            )}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Top row: Icon, Name, and Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{ 
                        backgroundColor: `${category.color || '#6B7280'}20`,
                        color: category.color || '#6B7280'
                      }}
                    >
                      <CategoryIcon 
                        icon={category.icon} 
                        color={category.color} 
                        size={28} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base leading-tight truncate">
                        {category.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {category.icon || 'No icon'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 shadow-sm",
                          category.kind === "income" 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {category.kind === "income" ? (
                            <><TrendingUp className="h-3 w-3 mr-1" />{t('entry.income')}</>
                          ) : (
                            <><TrendingDown className="h-3 w-3 mr-1" />{t('entry.expense')}</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 w-9 p-0 hover:bg-muted shrink-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem 
                          onClick={() => handleEdit(category)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingCategory(category)}
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Bottom row: Color and Status */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-6 h-6 rounded-lg border-2 border-background shadow-sm ring-1 ring-black/5"
                      style={{ backgroundColor: category.color || '#6B7280' }}
                    />
                    <span className="text-xs font-mono text-muted-foreground font-medium">
                      {category.color || '#6B7280'}
                    </span>
                  </div>
                  {category.is_hidden ? (
                    <Badge variant="outline" className="text-xs font-medium">
                      <EyeOff className="h-3 w-3 mr-1" />
                      {t('category.hidden')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs font-medium bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                      <Eye className="h-3 w-3 mr-1" />
                      {t('category.visible')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>{t('category.editCategory')}</DialogTitle>
              <DialogDescription>
                {t('category.editCategoryDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <CategoryForm
              category={editingCategory}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCategory(null)}
              isLoading={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingCategory && (
        <Dialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('category.deleteCategory')}</DialogTitle>
              <DialogDescription>
                {t('category.deleteConfirmation', { name: deletingCategory.name })}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setDeletingCategory(null)}
                disabled={deleteMutation.isPending}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deletingCategory)}
                disabled={deleteMutation.isPending}
                className="flex-1"
              >
                {deleteMutation.isPending ? "Deleting..." : t('common.delete')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
