"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { withToast, api } from "@/lib/api-with-toast";
import { EntryForm } from "./entry-form";

interface QuickAddEntryProps {
  budgetId: string;
  trigger?: React.ReactNode;
  className?: string;
}

export function QuickAddEntry({ budgetId, trigger, className }: QuickAddEntryProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["categories", budgetId],
    queryFn: () => api.categories.list(budgetId)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => withToast.entries.create(budgetId, {
      amount: Math.abs(data.amount),
      occurredOn: data.occurredOn,
      kind: data.kind,
      note: data.note,
      categoryId: data.categoryId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", budgetId] });
      queryClient.invalidateQueries({ queryKey: ["budget-balance", budgetId] });
      setOpen(false);
    },
    onError: () => {
      // Error toast is handled by withToast.entries.create
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
            {t('entry.recordTransaction')}
          </DialogDescription>
        </DialogHeader>
        
        <EntryForm
          budgetId={budgetId}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isLoading={createMutation.isPending}
          title={t('entry.addEntry')}
          description={t('entry.recordTransaction')}
          categories={categoriesQuery.data}
        />
      </DialogContent>
    </Dialog>
  );
}