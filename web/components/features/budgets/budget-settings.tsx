"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Settings, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, Budget, UpdateBudgetReq } from "@/lib/api";
import { toast } from "sonner";

const updateSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  description: z.string().optional(),
  currency_code: z.string().min(3, "Currency code must be at least 3 characters"),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

interface BudgetSettingsProps {
  budget: Budget;
  canEdit: boolean;
  canDelete: boolean;
}

export function BudgetSettings({ budget, canEdit, canDelete }: BudgetSettingsProps) {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: budget.name,
      description: budget.description || "",
      currency_code: budget.currency_code,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: UpdateBudgetReq) => api.budgets.update(budget.id, values),
    onSuccess: () => {
      toast.success(t('budget.budgetUpdated'));
      queryClient.invalidateQueries({ queryKey: ["budget", budget.id] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setUpdateDialogOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(t('common.error'), { 
        description: error instanceof Error ? error.message : t('common.error') 
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => api.budgets.update(budget.id, { archived: !budget.archived }),
    onSuccess: () => {
      toast.success(budget.archived ? t('budget.unarchiveBudget') : t('budget.archiveBudget'));
      queryClient.invalidateQueries({ queryKey: ["budget", budget.id] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: (error: unknown) => {
      toast.error(t('common.error'), { 
        description: error instanceof Error ? error.message : t('common.error') 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.budgets.delete(budget.id),
    onSuccess: () => {
      toast.success(t('budget.budgetDeleted'));
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      router.push("/");
    },
    onError: (error: unknown) => {
      toast.error(t('common.error'), { 
        description: error instanceof Error ? error.message : t('common.error') 
      });
    },
  });

  const handleUpdate = (values: UpdateFormValues) => {
    updateMutation.mutate(values);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
    setDeleteDialogOpen(false);
  };

  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('budget.budgetSettings')}
        </CardTitle>
        <CardDescription>
          {t('budget.manageBudget')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  {t('budget.updateBudget')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('budget.updateBudget')}</DialogTitle>
                  <DialogDescription>
                    {t('budget.budgetDetails')}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('budget.name')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('budget.description')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currency_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('budget.currency')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? t('common.loading') : t('common.save')}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setUpdateDialogOpen(false)}
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
              className="gap-2"
            >
              {budget.archived ? (
                <>
                  <ArchiveRestore className="h-4 w-4" />
                  {t('budget.unarchiveBudget')}
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  {t('budget.archiveBudget')}
                </>
              )}
            </Button>
          </div>
        )}

        {canDelete && (
          <div className="border-t pt-4">
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  {t('budget.deleteBudget')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('budget.deleteBudget')}</DialogTitle>
                  <DialogDescription>
                    {t('budget.confirmDelete')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="rounded-md bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">
                      {t('budget.deleteWarning')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? t('common.loading') : t('budget.deleteBudget')}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>{t('budget.status')}:</strong> {budget.archived ? t('budget.archived') : t('budget.active')}</p>
          <p><strong>{t('overview.created')}:</strong> {new Date(budget.created_at).toLocaleDateString()}</p>
          <p><strong>{t('common.updated')}:</strong> {new Date(budget.updated_at).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
