"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from 'next-intl';
import { User, Palette, Shield, Info, LogOut, Trash2, Globe, Monitor } from "lucide-react";
import { Link } from "@/lib/navigation";

import { ThemeSelector } from "@/components/features/shared/theme-selector";
import { LanguageSwitcher } from "@/components/features/shared/language-switcher";
import { VersionInfo } from "@/components/features/shared/version-info";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, clearAuth } = authStore();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  const handleSignOutEverywhere = () => {
    clearAuth();
    api.logout();
    toast.success(t('settings.signedOutEverywhere'));
    router.replace("/login");
  };

  const handlePurgeTokens = () => {
    sessionStorage.removeItem("philand-auth");
    clearAuth();
    toast.success(t('settings.tokensPurged'));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">
          {t('settings.manageAppPreferences')}
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile & Account */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('settings.profile')}
            </CardTitle>
            <CardDescription>
              {t('settings.managePersonalInfo')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Link href="/profile">
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  {t('settings.editProfile')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t('settings.appearance')}
            </CardTitle>
            <CardDescription>
              {t('settings.customizeAppearance')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">{t('settings.theme')}</p>
              </div>
              <ThemeSelector />
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">{t('settings.language')}</p>
              </div>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('settings.security')}
            </CardTitle>
            <CardDescription>
              {t('settings.manageAccountSecurity')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleSignOutEverywhere}
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                {t('settings.signOutEverywhere')}
              </Button>
              
              <Button
                variant="destructive"
                onClick={handlePurgeTokens}
                className="w-full justify-start gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('settings.purgeTokens')}
              </Button>
            </div>
            
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                {t('settings.securityNote')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {t('settings.appInformation')}
            </CardTitle>
            <CardDescription>
              {t('settings.versionAndBuild')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VersionInfo />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
