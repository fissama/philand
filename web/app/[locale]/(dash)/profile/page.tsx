"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Calendar, Mail, User, Shield, Clock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AvatarUpload } from "@/components/features/profile/avatar-upload";
import { ProfileForm } from "@/components/features/profile/profile-form";
import { api } from "@/lib/api";
import { authStore } from "@/lib/auth";
import { useEffect } from "react";

export default function ProfilePage() {
  const t = useTranslations();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.profile.get(),
  });

  // Sync profile data with auth store when loaded
  useEffect(() => {
    if (profileQuery.data) {
      authStore.getState().updateUser(profileQuery.data);
    }
  }, [profileQuery.data]);

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (profileQuery.error || !profileQuery.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">{t('common.error')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('profile.failedToLoad')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('profile.title')}</h1>
        <p className="text-muted-foreground">
          {t('profile.manageProfileInfo')}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar Upload */}
          <AvatarUpload 
            currentAvatar={profile.avatar} 
            userName={profile.name}
          />

          {/* Quick Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('profile.quickInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('settings.name')}</span>
                  <span className="text-sm font-medium">{profile.name}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('settings.role')}</span>
                  <Badge variant="secondary" className="text-xs">
                    {profile.role || 'User'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Forms & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <ProfileForm profile={profile} />

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('profile.accountInfo')}
              </CardTitle>
              <CardDescription>
                {t('profile.accountDetails')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{t('auth.email')}</p>
                      <p className="text-sm text-muted-foreground break-all">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{t('profile.memberSince')}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{t('profile.lastUpdated')}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(profile.updated_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{t('profile.accountStatus')}</p>
                      <Badge variant="outline" className="text-xs">
                        {t('profile.active')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
