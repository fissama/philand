"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";

const schema = z.object({ email: z.string().email() });

type FormValues = z.infer<typeof schema>;

export default function ForgotPage() {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const mutation = useMutation({
    mutationFn: api.forgotEmail,
    onSuccess: () => {
      toast.success("OTP sent", { description: "Check your email for the verification code." });
      router.push("/forgot-otp?email=" + form.getValues("email"));
    },
    onError: (error: unknown) => {
      toast.error("Request failed", { description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-muted-foreground">Enter your email to receive a one-time code.</p>
      </div>
      <Form {...form}>
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Sending..." : "Send OTP"}
          </Button>
        </form>
      </Form>
      <p className="text-sm text-muted-foreground">
        Remember your password? <Link href="/login" className="text-primary">Back to login</Link>
      </p>
    </div>
  );
}
