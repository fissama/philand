"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle } from "lucide-react";

import { BudgetCard } from "@/components/features/budgets/budget-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { toast } from "sonner";

const budgetSchema = z.object({
  name: z.string().min(2, "Name is required"),
  currency: z.string().min(1, "Currency is required")
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const budgetsQuery = useQuery({ queryKey: ["budgets"], queryFn: api.budgets.list });

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { name: "", currency: "USD" }
  });

  const mutation = useMutation({
    mutationFn: api.budgets.create,
    onSuccess: (data) => {
      toast.success("Budget created", { description: `${data.name} is ready!` });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setShowForm(false);
      form.reset();
    },
    onError: (error: unknown) => {
      toast.error("Failed to create budget", { description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const onSubmit = (values: BudgetFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-sm text-muted-foreground">Create and manage budgets.</p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          {showForm ? "Close" : "New budget"}
        </Button>
      </header>

      {showForm ? (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Create budget</CardTitle>
            <CardDescription>Set up a new envelope for your team.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Marketing Q3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input placeholder="USD" maxLength={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Creating..." : "Create budget"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : null}

      {budgetsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : budgetsQuery.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgetsQuery.data.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Create your first budget to begin tracking spending.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
