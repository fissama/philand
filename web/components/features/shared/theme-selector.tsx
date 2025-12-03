"use client";

import { Moon, Sun, Sparkles, Check } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { useToast } from "@/lib/toast";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const themeOptions = [
  {
    value: "light" as const,
    labelKey: "settings.themeLight",
    descriptionKey: "settings.themeLightDesc",
    icon: Sun,
    preview: "bg-white border-2 border-gray-200"
  },
  {
    value: "dark" as const,
    labelKey: "settings.themeDark",
    descriptionKey: "settings.themeDarkDesc",
    icon: Moon,
    preview: "bg-gray-900 border-2 border-gray-700"
  },
  {
    value: "colorful" as const,
    labelKey: "settings.themeColorful",
    descriptionKey: "settings.themeColorfulDesc",
    icon: Sparkles,
    preview: "bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200"
  }
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const t = useTranslations();

  const currentTheme = themeOptions.find(t => t.value === theme) || themeOptions[0];
  const Icon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Select theme">
          <Icon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('settings.chooseThemeLabel')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeOptions.map((themeOption) => {
          const ThemeIcon = themeOption.icon;
          const isActive = theme === themeOption.value;
          const label = t(themeOption.labelKey as any);
          const description = t(themeOption.descriptionKey as any);
          
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => {
                setTheme(themeOption.value);
                toast.success(t('settings.themeChanged', { theme: label }), {
                  description
                });
              }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className={`h-8 w-8 rounded-md ${themeOption.preview} flex items-center justify-center`}>
                <ThemeIcon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{label}</span>
                  {isActive && <Check className="h-4 w-4 text-primary" />}
                </div>
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
