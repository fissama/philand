"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { EntryForm } from "./entry-form";

interface GlobalQuickAddEntryProps {
  trigger?: React.ReactNode;
  className?: string;
  defaultBudgetId?: string;
}

export function GlobalQuickAddEntry({ trigger, className, defaultBudgetId }: GlobalQuickAddEntryProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ budgetId, ...data }: any) => api.entries.create(budgetId, {
      amount: Math.abs(data.amount),
      occurredOn: data.occurredOn,
      kind: data.kind,
      note: data.note,
      categoryId: data.categoryId,
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entries", variables.budgetId] });
      queryClient.invalidateQueries({ queryKey: ["budget-balance", variables.budgetId] });
      toast.success(t('entry.addEntry'));
      setOpen(false);
    },
    onError: (error) => {
      console.error("Failed to create entry:", error);
      toast.error(t('common.error'));
    },
  });

  const handleSubmit = async (data: any) => {
    await createMutation.mutateAsync(data);
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
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('entry.addEntry')}</DialogTitle>
          <DialogDescription>
            {t('entry.quickAddDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <EntryForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isLoading={createMutation.isPending}
          title={t('entry.addEntry')}
          description={t('entry.quickAddDescription')}
          showBudgetSelector={true}
          defaultBudgetId={defaultBudgetId}
        />
      </DialogContent>
    </Dialog>
  );
}