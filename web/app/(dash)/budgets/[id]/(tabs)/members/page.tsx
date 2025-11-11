"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { MemberList } from "@/components/features/members/member-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { authStore } from "@/lib/auth";
import { hasRole } from "@/lib/roles";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["Owner", "Manager", "Contributor", "Viewer"])
});

type FormValues = z.infer<typeof schema>;

export default function BudgetMembersPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = authStore();

  const membersQuery = useQuery({ queryKey: ["members", params.id], queryFn: () => api.members.list(params.id) });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", role: "Viewer" }
  });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => api.members.create(params.id, values),
    onSuccess: () => {
      toast.success("Member invited");
      queryClient.invalidateQueries({ queryKey: ["members", params.id] });
      form.reset({ email: "", role: "Viewer" });
    },
    onError: (error: unknown) => {
      toast.error("Failed to invite", { description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => api.members.remove(params.id, memberId),
    onSuccess: () => {
      toast.success("Member removed");
      queryClient.invalidateQueries({ queryKey: ["members", params.id] });
    },
    onError: (error: unknown) => {
      toast.error("Failed to remove", { description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      {membersQuery.isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading members...</CardContent>
        </Card>
      ) : (
        <MemberList members={membersQuery.data ?? []} currentRole={user?.role} onRemove={(id) => removeMutation.mutate(id)} />
      )}
      <Card>
        <CardHeader>
          <CardTitle>Invite member</CardTitle>
          <CardDescription>Owners can invite and manage members.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasRole(user?.role, "Owner") ? (
            <Form {...form}>
              <form className="grid gap-4" onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="teammate@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <select
                          className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          {...field}
                        >
                          <option value="Owner">Owner</option>
                          <option value="Manager">Manager</option>
                          <option value="Contributor">Contributor</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Inviting..." : "Send invite"}
                </Button>
              </form>
            </Form>
          ) : (
            <p className="text-sm text-muted-foreground">Only owners can invite new members.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
