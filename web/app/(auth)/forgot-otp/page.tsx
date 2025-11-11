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

const schema = z.object({ otp: z.string().min(4, "OTP is required") });

type FormValues = z.infer<typeof schema>;

export default function ForgotOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { otp: "" } });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => api.forgotOtp({ email, otp: values.otp }),
    onSuccess: (data) => {
      toast.success("OTP verified", { description: "Create a new password." });
      router.push(`/reset?token=${data.token}`);
    },
    onError: (error: unknown) => {
      toast.error("Verification failed", { description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verify OTP</h1>
        <p className="text-sm text-muted-foreground">Enter the code sent to {email}.</p>
      </div>
      <Form {...form}>
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OTP</FormLabel>
                <FormControl>
                  <Input placeholder="123456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </Form>
      <p className="text-sm text-muted-foreground">
        Didn\'t receive the code? <Link href="/forgot" className="text-primary">Resend</Link>
      </p>
    </div>
  );
}
