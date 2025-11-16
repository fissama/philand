"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Lime", value: "#84CC16" },
  { name: "Green", value: "#22C55E" },
  { name: "Emerald", value: "#10B981" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Sky", value: "#0EA5E9" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Fuchsia", value: "#C026D3" },
  { name: "Pink", value: "#DB2777" },
  { name: "Rose", value: "#E11D48" },
  { name: "Crimson", value: "#DC2626" },
  { name: "Gray", value: "#6B7280" },
  { name: "Slate", value: "#475569" },
  { name: "Zinc", value: "#52525B" },
  { name: "Stone", value: "#57534E" },
  { name: "Neutral", value: "#525252" },
  { name: "Black", value: "#000000" },
];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value = "#6B7280", onChange }: ColorPickerProps) {
  const t = useTranslations("category");
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange(color);
    }
  };

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-12 justify-start gap-3 px-3 border-2 hover:border-primary/50 transition-colors"
        >
          <div 
            className="w-6 h-6 rounded-md border-2 border-background shadow-sm"
            style={{ backgroundColor: value }}
          />
          <span className="flex-1 text-left font-mono text-sm">{value}</span>
          <Palette className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">{t("presetColors")}</Label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  title={color.name}
                  className={cn(
                    "relative w-9 h-9 rounded-lg border-2 transition-all hover:scale-110",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    value === color.value ? "border-primary shadow-md scale-105" : "border-border hover:border-primary/50"
                  )}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleColorSelect(color.value)}
                >
                  {value === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white drop-shadow-md" strokeWidth={3} />
                    </div>
                  )}
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <Label className="text-sm font-medium mb-3 block">{t("customColor")}</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="#FF5733"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value.toUpperCase())}
                  className="font-mono text-sm h-10"
                  maxLength={7}
                />
              </div>
              <div className="relative">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value.toUpperCase())}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="w-10 h-10 rounded-md border-2 border-border cursor-pointer hover:border-primary/50 transition-colors"
                  style={{ backgroundColor: customColor }}
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}