"use client";

import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/navigation';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthLogo } from "@/components/features/auth/auth-logo";
import { api } from "@/lib/api";
import { authStore } from "@/lib/auth";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const t = useTranslations();
  const router = useRouter();
  const setAuth = authStore((state) => state.setAuth);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" }
  });

  const mutation = useMutation({
    mutationFn: api.signup,
    onSuccess: (data) => {
      setAuth(data);
      toast.success("Welcome to Philand!", { description: "Your account is ready." });
      router.push("/");
    },
    onError: (error: unknown) => {
      toast.error("Sign up failed", { description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  return (
    <div className="space-y-10">
      {/* Logo */}
      <AuthLogo />

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-medium">{t('auth.signup')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
              {t('auth.login')}
            </Link>
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Your name"
                      className="h-11 border-border bg-background"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder={t('auth.email')}
                      className="h-11 border-border bg-background"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={t('auth.password')}
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
              {mutation.isPending ? "Creating..." : t('auth.signup')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
