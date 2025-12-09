"use client";

import { Home, Wallet, Plus, Settings, Bell } from "lucide-react";
import { Link, usePathname } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { GlobalQuickAddEntry } from "@/components/features/entries/global-quick-add-entry";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";

const links = [
  { href: "/", label: "nav.dashboard", icon: Home },
  { href: "/budgets", label: "nav.budgets", icon: Wallet },
  { href: "/settings", label: "nav.settings", icon: Settings },
];

export function MobileActionBar() {
  const pathname = usePathname();
  const t = useTranslations();

  // Split links into left and right groups for center positioning
  const leftLinks = links.slice(0, 2); // Home, Budgets
  const rightLinks = links.slice(2); // Settings

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-lg -translate-x-1/2 rounded-2xl border border-border bg-background/95 p-2.5 shadow-xl backdrop-blur-md md:hidden">
      <div className="flex items-center justify-between">
        {/* Left Navigation Items */}
        <div className="flex items-center gap-0.5">
          {leftLinks.map(({ href, label, icon: Icon }) => {
            const cleanPathname = pathname.replace(/^\/(en|vi)/, '') || '/';
            const active = cleanPathname === href || (href === '/' && cleanPathname === '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all duration-200 min-w-[60px]",
                  active 
                    ? "bg-primary text-primary-foreground shadow-md scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95"
                )}
              >
                <Icon className={cn("transition-all duration-200", active ? "h-6 w-6" : "h-5 w-5")} />
                <span className="text-[9px] font-medium truncate max-w-[55px]">{t(label)}</span>
              </Link>
            );
          })}
        </div>

        {/* Center Add Button */}
        <div className="relative -mx-2">
          <GlobalQuickAddEntry
            trigger={
              <button className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95">
                <Plus className="h-7 w-7" />
              </button>
            }
          />
        </div>

        {/* Right Navigation Items */}
        <div className="flex items-center gap-0.5">
          {/* Notification Link */}
          <NotificationLink />
          
          {rightLinks.map(({ href, label, icon: Icon }) => {
            const cleanPathname = pathname.replace(/^\/(en|vi)/, '') || '/';
            const active = cleanPathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all duration-200 min-w-[60px]",
                  active 
                    ? "bg-primary text-primary-foreground shadow-md scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95"
                )}
              >
                <Icon className={cn("transition-all duration-200", active ? "h-6 w-6" : "h-5 w-5")} />
                <span className="text-[9px] font-medium truncate max-w-[55px]">{t(label)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// Notification Link Component with Badge
function NotificationLink() {
  const pathname = usePathname();
  const t = useTranslations();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const data = await apiRequest<{ count: number }>('/api/notifications/unread-count');
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const cleanPathname = pathname.replace(/^\/(en|vi)/, '') || '/';
  const active = cleanPathname === '/notifications';

  return (
    <Link
      href="/notifications"
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all duration-200 relative min-w-[60px]",
        active 
          ? "bg-primary text-primary-foreground shadow-md scale-105" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95"
      )}
    >
      <div className="relative">
        <Bell className={cn("transition-all duration-200", active ? "h-6 w-6" : "h-5 w-5")} />
        {unreadCount > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[9px] bg-red-500 text-white border-0"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </div>
      <span className="text-[9px] font-medium truncate max-w-[55px]">{t('notifications.title')}</span>
    </Link>
  );
}
