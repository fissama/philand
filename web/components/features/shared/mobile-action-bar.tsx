"use client";

import { Home, Settings, Wallet, Plus, User } from "lucide-react";
import { Link, usePathname } from "@/lib/navigation";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { GlobalQuickAddEntry } from "@/components/features/entries/global-quick-add-entry";

const links = [
  { href: "/", label: "nav.dashboard", icon: Home },
  { href: "/budgets", label: "nav.budgets", icon: Wallet },
  { href: "/profile", label: "settings.profile", icon: User },
  { href: "/settings", label: "nav.settings", icon: Settings }
];

export function MobileActionBar() {
  const pathname = usePathname();
  const t = useTranslations();

  // Split links into left and right groups for center positioning
  const leftLinks = links.slice(0, 2); // Home, Budgets
  const rightLinks = links.slice(2); // Profile, Settings

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-lg -translate-x-1/2 rounded-2xl border border-border bg-background/95 p-2 shadow-xl backdrop-blur-md md:hidden">
      <div className="flex items-center justify-between">
        {/* Left Navigation Items */}
        <div className="flex items-center gap-1">
          {leftLinks.map(({ href, label, icon: Icon }) => {
            // Remove locale prefix for comparison
            const cleanPathname = pathname.replace(/^\/(en|vi)/, '') || '/';
            const active = cleanPathname === href || (href === '/' && cleanPathname === '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200",
                  active 
                    ? "bg-primary text-primary-foreground shadow-md scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("transition-all duration-200", active ? "h-5 w-5" : "h-4 w-4")} />
                <span className="truncate max-w-[60px]">{t(label)}</span>
              </Link>
            );
          })}
        </div>

        {/* Center Add Button */}
        <div className="relative">
          <GlobalQuickAddEntry
            trigger={
              <button className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95">
                <Plus className="h-6 w-6" />
              </button>
            }
          />
          {/* Floating label */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none">
            {t('entry.add')}
          </div>
        </div>

        {/* Right Navigation Items */}
        <div className="flex items-center gap-1">
          {rightLinks.map(({ href, label, icon: Icon }) => {
            // Remove locale prefix for comparison
            const cleanPathname = pathname.replace(/^\/(en|vi)/, '') || '/';
            const active = cleanPathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200",
                  active 
                    ? "bg-primary text-primary-foreground shadow-md scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("transition-all duration-200", active ? "h-5 w-5" : "h-4 w-4")} />
                <span className="truncate max-w-[60px]">{t(label)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
