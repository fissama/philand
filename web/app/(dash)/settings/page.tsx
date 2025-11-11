"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ThemeToggle } from "@/components/features/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authStore } from "@/lib/auth";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const { user, clearAuth } = authStore();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal info.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-semibold">{user?.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Role</p>
            <p className="font-semibold">{user?.role}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose how Philand looks.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your sessions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => {
              clearAuth();
              api.logout();
              router.replace("/login");
            }}
          >
            Sign out everywhere
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              sessionStorage.removeItem("philand-auth");
              clearAuth();
            }}
          >
            Purge stored tokens
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
