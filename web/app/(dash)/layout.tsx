"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { AppHeader } from "@/components/features/shared/app-header";
import { MobileActionBar } from "@/components/features/shared/mobile-action-bar";
import { useAuthGuard } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAuthGuard();
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 bg-muted/20 px-4 pb-24 pt-6 sm:px-8">{children}</main>
      <MobileActionBar />
    </div>
  );
}
