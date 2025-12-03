"use client";

import Image from "next/image";
import { Link, useRouter } from "@/lib/navigation";
import { useMemo } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

import { authStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { HealthBadge } from "@/components/features/shared/health-badge";
import { ThemeSelector } from "@/components/features/shared/theme-selector";
import { LanguageSwitcher } from "@/components/features/shared/language-switcher";
import { getAppVersion } from "@/lib/version";

export function AppHeader() {
  const router = useRouter();
  const { user } = authStore();

  const initials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const handleLogout = () => {
    api.logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/philand.png"
            alt="Logo"
            width={36}
            height={36}
            className="h-9 w-auto transition-transform group-hover:scale-110"
            priority
          />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent hidden sm:block">
            Philand
          </span>
        </Link>
        <HealthBadge />
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSelector />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-9 w-9">
                {user?.avatar && (
                  <AvatarImage 
                    key={user.avatar}
                    src={user.avatar} 
                    alt={user.name}
                    loading="lazy"
                  />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold">{user?.name ?? "Guest"}</p>
                <p className="text-xs text-muted-foreground">{user?.role ?? ""}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Version {getAppVersion()}
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
