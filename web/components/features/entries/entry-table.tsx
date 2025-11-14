"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { Entry, CategoryKind } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMoneyFromMinor } from "@/lib/format";
import { EditEntryDialog } from "@/components/features/entries/edit-entry-dialog";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface EntryTableProps {
  entries?: Entry[];
  loading?: boolean;
  categories?: Array<{ id: string; name: string; kind: CategoryKind }>;
  sortBy?: "date" | "amount" | "description";
  sortOrder?: "asc" | "desc";
  onSort?: (field: "date" | "amount" | "description") => void;
  currency?: string;
  budgetId?: string;
  onEntryUpdate?: () => void;
  canEdit?: boolean;
}

export function EntryTable({ 
  entries = [], 
  loading, 
  categories = [],
  sortBy,
  sortOrder,
  onSort,
  currency,
  budgetId,
  onEntryUpdate,
  canEdit = false
}: EntryTableProps) {
  const t = useTranslations();
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const handleDeleteEntry = async (entryId: string) => {
    if (!budgetId || !window.confirm(t('entry.confirmDelete'))) return;
    
    try {
      await api.entries.delete(budgetId, entryId);
      toast.success(t('entry.entryDeleted'));
      onEntryUpdate?.();
    } catch (error) {
      toast.error(t('common.error'), {
        description: error instanceof Error ? error.message : t('common.error')
      });
    }
  };
  
  const SortIcon = ({ field }: { field: "date" | "amount" | "description" }) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortOrder === "asc" 
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const body = useMemo(() => {
    if (loading) {
      return (
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      );
    }

    if (!entries.length) {
      return <p className="text-sm text-muted-foreground">{t('entry.noEntries')}</p>;
    }

    return (
      <div className="space-y-3">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th 
                  className="pb-3 text-left text-xs font-semibold uppercase text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => onSort?.("date")}
                >
                  <div className="flex items-center">
                    {t('entry.date')}
                    <SortIcon field="date" />
                  </div>
                </th>
                <th 
                  className="pb-3 text-left text-xs font-semibold uppercase text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => onSort?.("description")}
                >
                  <div className="flex items-center">
                    {t('entry.description')}
                    <SortIcon field="description" />
                  </div>
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-muted-foreground">{t('entry.category')}</th>
                <th className="pb-3 text-center text-xs font-semibold uppercase text-muted-foreground">{t('entry.type')}</th>
                <th 
                  className="pb-3 text-right text-xs font-semibold uppercase text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => onSort?.("amount")}
                >
                  <div className="flex items-center justify-end">
                    {t('entry.amount')}
                    <SortIcon field="amount" />
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
              {entries.map((entry) => {
                const category = categories.find((c) => c.id === entry.category_id);
                // Use budget currency if provided, otherwise fall back to entry currency
                const displayCurrency = currency || entry.currency_code;
                const formattedAmount = formatMoneyFromMinor(entry.amount_minor, displayCurrency);
                
                return (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(entry.entry_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-sm font-medium">
                      {entry.description || entry.counterparty || t('entry.description')}
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {category?.name || t('entry.noCategory')}
                    </td>
                    <td className="py-3 text-center">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        entry.kind === "income" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {entry.kind === "income" ? t('entry.income') : t('entry.expense')}
                      </span>
                    </td>
                    <td className="py-3 text-right text-sm font-semibold whitespace-nowrap">
                      <span className={entry.kind === "income" ? "text-emerald-600" : "text-red-600"}>
                        {entry.kind === "income" ? "+" : "-"}
                        {formattedAmount}
                      </span>
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
                            <DropdownMenuItem onClick={() => setEditingEntry(entry)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEntry(entry.id)}
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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {entries.map((entry) => {
            const category = categories.find((c) => c.id === entry.category_id);
            // Use budget currency if provided, otherwise fall back to entry currency
            const displayCurrency = currency || entry.currency_code;
            const formattedAmount = formatMoneyFromMinor(entry.amount_minor, displayCurrency);
            
            return (
              <Card 
                key={entry.id} 
                className={cn(
                  "border-border cursor-pointer transition-colors",
                  canEdit && "hover:bg-muted/50",
                  expandedEntry === entry.id && "ring-2 ring-primary/20"
                )}
                onClick={() => canEdit && setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{entry.description || entry.counterparty || t('entry.description')}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(entry.entry_date).toLocaleDateString()} • {category?.name || t('entry.noCategory')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                        entry.kind === "income" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {entry.kind === "income" ? t('entry.income') : t('entry.expense')}
                      </span>
                      {canEdit && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-base font-bold",
                      entry.kind === "income" ? "text-emerald-600" : "text-red-600"
                    )}>
                      {entry.kind === "income" ? "+" : "-"}
                      {formattedAmount}
                    </span>
                    {canEdit && expandedEntry === entry.id && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEntry(entry);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {t('common.edit')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEntry(entry.id);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t('common.delete')}
                        </Button>
                      </div>
                    )}
                  </div>
                  {canEdit && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {expandedEntry === entry.id ? t('entry.tapToCollapse') : t('entry.tapToExpand')}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }, [entries, loading, categories]);

  return (
    <div>
      {body}
      {editingEntry && (
        <EditEntryDialog
          entry={editingEntry}
          categories={categories}
          budgetId={budgetId}
          open={!!editingEntry}
          onOpenChange={(open: boolean) => !open && setEditingEntry(null)}
          onSuccess={() => {
            setEditingEntry(null);
            onEntryUpdate?.();
          }}
        />
      )}
    </div>
  );
}
