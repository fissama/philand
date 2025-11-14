"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, UserProfile } from "@/lib/api";
import { authStore } from "@/lib/auth";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  timezone: z.string().max(50, "Invalid timezone").optional(),
  locale: z.string().max(10, "Invalid locale").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  readonly profile: UserProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name || "",
      bio: profile.bio || "",
      timezone: profile.timezone || "UTC",
      locale: profile.locale || "en",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) => api.profile.update(values),
    onSuccess: (updatedProfile) => {
      toast.success(t('profile.profileUpdated'));
      // Update auth store immediately for header to reflect change
      authStore.getState().updateUser(updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: unknown) => {
      toast.error(t('common.error'), {
        description: error instanceof Error ? error.message : 'Failed to update profile'
      });
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    // Sanitize inputs before sending
    const sanitized = {
      name: values.name?.trim(),
      bio: values.bio?.trim().slice(0, 500), // Limit bio to 500 chars
      timezone: values.timezone?.trim(),
      locale: values.locale?.trim(),
    };
    mutation.mutate(sanitized);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.personalInfo')}</CardTitle>
        <CardDescription>
          Update your personal information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profile.bio')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('profile.bioPlaceholder')}
                      className="resize-none"
                      rows={4}
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {field.value?.length || 0}/500 characters
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.timezone')}</FormLabel>
                    <FormControl>
                      <Input placeholder="UTC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locale</FormLabel>
                    <FormControl>
                      <Input placeholder="en" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t('common.loading') : t('profile.saveChanges')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={mutation.isPending}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
