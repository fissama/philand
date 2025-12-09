'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ArrowRight, Loader2 } from 'lucide-react';
import { api, type BudgetSummary, type Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface TransferDialogProps {
  currentBudgetId?: string;
  trigger?: React.ReactNode;
}

export function TransferDialog({ currentBudgetId, trigger }: TransferDialogProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [fromBudgetId, setFromBudgetId] = useState(currentBudgetId || '');
  const [toBudgetId, setToBudgetId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [fromCategoryId, setFromCategoryId] = useState('');
  const [toCategoryId, setToCategoryId] = useState('');
  const [occurredOn, setOccurredOn] = useState(new Date().toISOString().slice(0, 10));

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => api.budgets.list(),
  });

  const contributorBudgets = budgets.filter(
    (b: BudgetSummary) => b.user_role === 'contributor' || b.user_role === 'manager' || b.user_role === 'owner'
  );

  const { data: fromCategories = [] } = useQuery({
    queryKey: ['categories', fromBudgetId],
    queryFn: () => api.categories.list(fromBudgetId),
    enabled: !!fromBudgetId,
  });

  const { data: toCategories = [] } = useQuery({
    queryKey: ['categories', toBudgetId],
    queryFn: () => api.categories.list(toBudgetId),
    enabled: !!toBudgetId,
  });

  const expenseCategories = fromCategories.filter((c: Category) => c.kind === 'expense');
  const incomeCategories = toCategories.filter((c: Category) => c.kind === 'income');

  const fromBudget = contributorBudgets.find((b: BudgetSummary) => b.id === fromBudgetId);
  const toBudget = contributorBudgets.find((b: BudgetSummary) => b.id === toBudgetId);

  const transferMutation = useMutation({
    mutationFn: (data: {
      from_budget_id: string;
      to_budget_id: string;
      amount: number;
      transfer_date: string;
      currency_code: string;
      note?: string;
      from_category_id: string;
      to_category_id: string;
    }) => api.transfers.create(data),
    onSuccess: (result) => {
      toast.success(t('common.success'), {
        description: `Transferred ${result.transfer.amount_minor / 100} ${result.transfer.currency_code} from ${result.from_budget_name} to ${result.to_budget_name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['budget-balance'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(t('common.error'), {
        description: error.message || 'Failed to create transfer',
      });
    },
  });

  const resetForm = () => {
    setFromBudgetId(currentBudgetId || '');
    setToBudgetId('');
    setAmount('');
    setNote('');
    setFromCategoryId('');
    setToCategoryId('');
    setOccurredOn(new Date().toISOString().slice(0, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromBudgetId || !toBudgetId || !amount || !fromCategoryId || !toCategoryId) {
      toast.error(t('common.error'), {
        description: 'Please fill in all required fields',
      });
      return;
    }

    if (fromBudgetId === toBudgetId) {
      toast.error(t('common.error'), {
        description: 'Cannot transfer to the same budget',
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error(t('common.error'), {
        description: 'Amount must be a positive number',
      });
      return;
    }

    if (!fromBudget || !toBudget) {
      toast.error(t('common.error'), {
        description: 'Budget not found',
      });
      return;
    }

    transferMutation.mutate({
      from_budget_id: fromBudgetId,
      to_budget_id: toBudgetId,
      amount: amountNum,
      transfer_date: occurredOn,
      currency_code: fromBudget.currency_code,
      note: note || undefined,
      from_category_id: fromCategoryId,
      to_category_id: toCategoryId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            Transfer Money
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Transfer Between Budgets</DialogTitle>
          <DialogDescription>
            Transfer money from one budget to another. Both budgets must have the same currency.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-budget">From Budget *</Label>
              <Select value={fromBudgetId} onValueChange={setFromBudgetId}>
                <SelectTrigger id="from-budget">
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  {contributorBudgets.map((budget: BudgetSummary) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      {budget.name} ({budget.currency_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-budget">To Budget *</Label>
              <Select value={toBudgetId} onValueChange={setToBudgetId}>
                <SelectTrigger id="to-budget">
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  {contributorBudgets
                    .filter((b: BudgetSummary) => b.id !== fromBudgetId)
                    .map((budget: BudgetSummary) => (
                      <SelectItem key={budget.id} value={budget.id}>
                        {budget.name} ({budget.currency_code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-category">From Category (Expense) *</Label>
              <Select value={fromCategoryId} onValueChange={setFromCategoryId} disabled={!fromBudgetId}>
                <SelectTrigger id="from-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-category">To Category (Income) *</Label>
              <Select value={toCategoryId} onValueChange={setToCategoryId} disabled={!toBudgetId}>
                <SelectTrigger id="to-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {incomeCategories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={occurredOn}
                onChange={(e) => setOccurredOn(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this transfer..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={transferMutation.isPending}>
              {transferMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Transfer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
