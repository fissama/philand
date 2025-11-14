"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthLogo } from "@/components/features/auth/auth-logo";
import { api } from "@/lib/api";
import { toast } from "sonner";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters")
});

type FormValues = z.infer<typeof schema>;

export default function ResetPage() {
  const t = useTranslations();
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
    <div className="space-y-10">
      {/* Logo */}
      <AuthLogo />

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-medium">Choose a new password</h2>
          <p className="text-sm text-muted-foreground">
            Create a secure password for your account
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="New password"
                      className="h-11 border-border bg-background"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="h-11 w-full font-medium"
            >
              {mutation.isPending ? "Resetting..." : t('auth.resetPassword')}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <Link 
            href="/login" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
