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
import { toast } from "sonner";

const schema = z.object({ email: z.string().email() });

type FormValues = z.infer<typeof schema>;

export default function ForgotPage() {
  const t = useTranslations();
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const mutation = useMutation({
    mutationFn: api.forgotEmail,
    onSuccess: () => {
      toast.success(t('auth.otpSent'), { description: t('auth.checkEmail') });
      router.push("/forgot-otp?email=" + form.getValues("email"));
    },
    onError: (error: unknown) => {
      toast.error(t('common.error'), { description: error instanceof Error ? error.message : t('common.error') });
    }
  });

  return (
    <div className="space-y-10">
      {/* Logo */}
      <AuthLogo />

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-medium">{t('auth.resetPassword')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('auth.enterEmailForCode')}
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
            
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="h-11 w-full font-medium"
            >
              {mutation.isPending ? t('auth.sending') : t('auth.sendOTP')}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <Link 
            href="/login" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
