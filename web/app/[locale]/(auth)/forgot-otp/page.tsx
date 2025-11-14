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

const schema = z.object({ otp: z.string().min(4, "OTP is required") });

type FormValues = z.infer<typeof schema>;

export default function ForgotOtpPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { otp: "" } });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => api.forgotOtp({ email, otp: values.otp }),
    onSuccess: (data) => {
      toast.success(t('auth.otpVerified'), { description: t('auth.resetPassword') });
      router.push(`/reset?token=${data.token}`);
    },
    onError: (error: unknown) => {
      toast.error(t('auth.verificationFailed'), { description: error instanceof Error ? error.message : t('common.error') });
    }
  });

  return (
    <div className="space-y-10">
      {/* Logo */}
      <AuthLogo />

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-medium">{t('auth.verifyOTP')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('auth.enterCode')} <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder={t('auth.verifyOTP')}
                      className="h-11 border-border bg-background text-center text-lg tracking-widest"
                      maxLength={6}
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
              {mutation.isPending ? t('auth.verifying') : t('auth.verifyOTP')}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <Link 
            href="/forgot" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('auth.didntReceiveCode')}
          </Link>
        </div>
      </div>
    </div>
  );
}
