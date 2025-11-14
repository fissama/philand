"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
  "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#C026D3", "#DB2777", "#E11D48", "#DC2626",
  "#9CA3AF", "#6B7280", "#374151", "#1F2937", "#111827", "#000000",
  "#F3F4F6", "#E5E7EB", "#D1D5DB", "#9CA3AF", "#6B7280", "#4B5563",
];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value = "#6B7280", onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange(color);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-12 h-12 p-0 border-2"
          style={{ backgroundColor: value }}
        >
          <span className="sr-only">Pick color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preset Colors</label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <Button
                  key={color}
                  variant="outline"
                  className={cn(
                    "w-8 h-8 p-0 border-2",
                    value === color && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color);
                    setCustomColor(color);
                    setOpen(false);
                  }}
                >
                  <span className="sr-only">{color}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Custom Color</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="#FF5733"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="font-mono text-sm"
              />
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-12 h-10 rounded border border-input cursor-pointer"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}