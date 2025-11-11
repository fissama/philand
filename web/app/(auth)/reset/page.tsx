"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters")
});

type FormValues = z.infer<typeof schema>;

export default function ResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { password: "" } });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => api.resetPassword({ token, password: values.password }),
    onSuccess: () => {
      toast.success("Password updated", { description: "You can now sign in with your new password." });
      router.push("/login");
    },
    onError: (error: unknown) => {
      toast.error("Reset failed", { description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Choose a new password</h1>
        <p className="text-sm text-muted-foreground">Your account will stay safe with a fresh password.</p>
      </div>
      <Form {...form}>
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      </Form>
      <p className="text-sm text-muted-foreground">
        Know your password? <Link href="/login" className="text-primary">Back to login</Link>
      </p>
    </div>
  );
}
