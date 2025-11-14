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
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const setAuth = authStore((state) => state.setAuth);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  const mutation = useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      setAuth(data);
      toast.success(t('dashboard.welcome'), { description: t('auth.loginSuccess') });
      router.push("/");
    },
    onError: (error: unknown) => {
      toast.error(t('common.error'), { description: error instanceof Error ? error.message : t('auth.invalidCredentials') });
    }
  });

  return (
    <div className="space-y-10">
      {/* Logo */}
      <AuthLogo />

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-medium">{t('auth.login')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('auth.dontHaveAccount')}{' '}
            <Link href="/signup" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
              {t('auth.signup')}
            </Link>
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
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
              {mutation.isPending ? t('common.loading') : t('auth.login')}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <Link 
            href="/forgot" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>
      </div>
    </div>
  );
}
