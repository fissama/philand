"use client";

import { useTranslations } from 'next-intl';
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, type Entry, type CategoryKind } from "@/lib/api";
import { EntryForm } from "./entry-form";

interface EditEntryDialogProps {
  entry: Entry;
  categories: Array<{ id: string; name: string; kind: CategoryKind }>;
  budgetId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditEntryDialog({ 
  entry, 
  categories, 
  budgetId, 
  open, 
  onOpenChange, 
  onSuccess 
}: EditEntryDialogProps) {
  const t = useTranslations();

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      if (!budgetId) throw new Error("Budget ID is required");
      return api.entries.update(budgetId, entry.id, {
        amount: Math.abs(data.amount),
        occurredOn: data.occurredOn,
        kind: data.kind,
        note: data.note,
        categoryId: data.categoryId,
      });
    },
    onSuccess: () => {
      toast.success(t('entry.entryUpdated'));
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Failed to update entry:", error);
      toast.error(t('common.error'));
    },
  });

  const handleSubmit = async (data: any) => {
    await updateMutation.mutateAsync(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('entry.editEntry')}</DialogTitle>
          <DialogDescription>
            {t('entry.updateTransaction')}
          </DialogDescription>
        </DialogHeader>
        
        <EntryForm
          budgetId={budgetId}
          entry={entry}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={updateMutation.isPending}
          title={t('entry.editEntry')}
          description={t('entry.updateTransaction')}
          categories={categories}
        />
      </DialogContent>
    </Dialog>
  );
}