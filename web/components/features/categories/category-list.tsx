import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, FolderOpen, MoreVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
}

export function CategoryList({ 
  categories, 
  emptyMessage = "No categories yet.", 
  budgetId,
  canEdit = false,
  onCategoryUpdate,
  viewMode = "all"
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

  if (!categories.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          {viewMode === "hidden" ? "No hidden categories" : "No categories yet"}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {categories.map((category) => (
        <div
          key={category.id}
          className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
            category.is_hidden 
              ? "border-muted bg-muted/20" 
              : "border-transparent shadow-sm"
          }`}
          style={!category.is_hidden ? { 
            borderColor: `${category.color || '#6B7280'}30`,
            backgroundColor: `${category.color || '#6B7280'}08`
          } : {}}
        >
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, ${category.color || '#6B7280'} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${category.color || '#6B7280'} 0%, transparent 50%)`
            }}
          />
          
          <div className="relative p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div 
                  className={`p-3 rounded-xl shadow-sm ${category.is_hidden ? 'bg-muted' : ''}`}
                  style={!category.is_hidden ? { 
                    backgroundColor: `${category.color || '#6B7280'}20`,
                    color: category.color || '#6B7280'
                  } : {}}
                >
                  <CategoryIcon 
                    icon={category.icon} 
                    color={category.is_hidden ? "#9CA3AF" : category.color} 
                    size={20} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold truncate ${category.is_hidden ? 'text-muted-foreground' : ''}`}>
                    {category.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${category.is_hidden ? "text-muted-foreground" : ""}`}
                      style={!category.is_hidden ? { 
                        borderColor: category.color || '#6B7280',
                        color: category.color || '#6B7280',
                        backgroundColor: `${category.color || '#6B7280'}10`
                      } : {}}
                    >
                      {category.is_hidden ? "Hidden" : 
                       category.kind === "income" ? (
                        <><TrendingUp className="h-3 w-3 mr-1" />Income</>
                       ) : (
                        <><TrendingDown className="h-3 w-3 mr-1" />Expense</>
                       )}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
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
              )}
            </div>
          </div>
        </div>
      ))}

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
