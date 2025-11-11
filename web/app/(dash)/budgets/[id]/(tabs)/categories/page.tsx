"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CategoryList } from "@/components/features/categories/category-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { authStore } from "@/lib/auth";
import { hasRole } from "@/lib/roles";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  kind: z.enum(["income", "expense"])
});

type FormValues = z.infer<typeof schema>;

export default function BudgetCategoriesPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = authStore();

  const categoriesQuery = useQuery({
    queryKey: ["categories", params.id],
    queryFn: () => api.categories.list(params.id)
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", kind: "expense" }
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => api.categories.create(params.id, values),
    onSuccess: () => {
      toast.success("Category created");
      queryClient.invalidateQueries({ queryKey: ["categories", params.id] });
      form.reset();
    },
    onError: (error: unknown) => {
      toast.error("Failed to create category", { description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  return (
    <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
      <Card className="md:order-last">
        <CardHeader>
          <CardTitle>Create category</CardTitle>
          <CardDescription>Categories help everyone stay organised.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasRole(user?.role, "Manager") ? (
            <Form {...form}>
              <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Media spend" {...field} />
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
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Create category"}
                </Button>
              </form>
            </Form>
          ) : (
            <p className="text-sm text-muted-foreground">Only managers or owners can create categories.</p>
          )}
        </CardContent>
      </Card>
      <div>{categoriesQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : <CategoryList categories={categoriesQuery.data ?? []} />}</div>
    </div>
  );
}
