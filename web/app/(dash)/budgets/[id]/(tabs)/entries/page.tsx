"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EntryTable } from "@/components/features/entries/entry-table";
import { DateRangePicker } from "@/components/features/forms/date-range-picker";
import { MoneyInput } from "@/components/features/forms/money-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";

const schema = z.object({
  amount: z.number().positive("Amount is required"),
  occurredOn: z.string().min(1, "Date is required"),
  kind: z.enum(["income", "expense"]),
  note: z.string().optional(),
  categoryId: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function BudgetEntriesPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{ kind?: "income" | "expense" | "all"; from?: string; to?: string }>({ kind: "all" });

  const categoriesQuery = useQuery({
    queryKey: ["categories", params.id],
    queryFn: () => api.categories.list(params.id)
  });

  const entriesQuery = useQuery({
    queryKey: ["entries", params.id, filters],
    queryFn: () =>
      api.entries.list(params.id, {
        kind: filters.kind && filters.kind !== "all" ? filters.kind : undefined,
        from: filters.from,
        to: filters.to
      })
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, occurredOn: new Date().toISOString().slice(0, 10), kind: "expense" }
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.entries.create(params.id, {
        ...values,
        amount: Math.abs(values.amount)
      }),
    onSuccess: () => {
      toast.success("Entry added");
      queryClient.invalidateQueries({ queryKey: ["entries", params.id] });
      form.reset({ amount: 0, occurredOn: new Date().toISOString().slice(0, 10), kind: "expense" });
    },
    onError: (error: unknown) => {
      toast.error("Failed to add entry", { description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const categories = categoriesQuery.data ?? [];

  const handleSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const summary = useMemo(() => {
    if (!entriesQuery.data?.data) return null;
    const income = entriesQuery.data.data
      .filter((entry) => entry.kind === "income")
      .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
    const expense = entriesQuery.data.data
      .filter((entry) => entry.kind === "expense")
      .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
    return { income, expense, net: income - expense };
  }, [entriesQuery.data]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Slice your transactions by type or time.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Button
            type="button"
            variant={filters.kind === "all" ? "default" : "outline"}
            onClick={() => setFilters((prev) => ({ ...prev, kind: "all" }))}
          >
            All
          </Button>
          <Button
            type="button"
            variant={filters.kind === "income" ? "default" : "outline"}
            onClick={() => setFilters((prev) => ({ ...prev, kind: "income" }))}
          >
            Income
          </Button>
          <Button
            type="button"
            variant={filters.kind === "expense" ? "default" : "outline"}
            onClick={() => setFilters((prev) => ({ ...prev, kind: "expense" }))}
          >
            Expense
          </Button>
          <DateRangePicker
            value={{ from: filters.from, to: filters.to }}
            onChange={(value) => setFilters((prev) => ({ ...prev, ...value }))}
          />
        </CardContent>
      </Card>

      <Card className="md:grid md:grid-cols-[1.2fr_1fr] md:gap-6">
        <CardContent className="p-6 md:border-r md:border-border">
          <h3 className="text-lg font-semibold">Add entry</h3>
          <Form {...form}>
            <form className="grid gap-4 pt-4" onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <MoneyInput
                        {...field}
                        onChange={(event) => {
                          const next = parseFloat(event.target.value);
                          field.onChange(Number.isNaN(next) ? 0 : next);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occurredOn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <select
                        className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...field}
                      >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input list="categories" {...field} />
                    </FormControl>
                    <datalist id="categories">
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional note" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Add entry"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardContent className="space-y-4 p-6">
          <div className="rounded-2xl bg-muted/40 p-4 text-sm">
            <p className="text-muted-foreground">Income</p>
            <p className="text-lg font-semibold text-emerald-500">{summary?.income?.toLocaleString() ?? "0"}</p>
            <p className="text-muted-foreground">Expense</p>
            <p className="text-lg font-semibold text-rose-500">{summary?.expense?.toLocaleString() ?? "0"}</p>
            <p className="text-muted-foreground">Net</p>
            <p className="text-lg font-semibold">{summary?.net?.toLocaleString() ?? "0"}</p>
          </div>
          <EntryTable entries={entriesQuery.data?.data} loading={entriesQuery.isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
