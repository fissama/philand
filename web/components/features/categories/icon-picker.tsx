"use client";

import { useState } from "react";
import { 
  Home, Car, ShoppingCart, Utensils, Coffee, Gamepad2, 
  Heart, Plane, Gift, Music, Book, Dumbbell, Shirt, 
  Smartphone, Laptop, Wrench, Fuel, Zap, Wifi, Phone,
  DollarSign, TrendingUp, Briefcase, PiggyBank, CreditCard,
  Building, Users, GraduationCap, Stethoscope, Baby,
  TreePine, Flower, Sun, Cloud, Umbrella, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS = [
  { name: "Home", icon: Home },
  { name: "Car", icon: Car },
  { name: "Shopping", icon: ShoppingCart },
  { name: "Food", icon: Utensils },
  { name: "Coffee", icon: Coffee },
  { name: "Entertainment", icon: Gamepad2 },
  { name: "Health", icon: Heart },
  { name: "Travel", icon: Plane },
  { name: "Gifts", icon: Gift },
  { name: "Music", icon: Music },
  { name: "Education", icon: Book },
  { name: "Fitness", icon: Dumbbell },
  { name: "Clothing", icon: Shirt },
  { name: "Phone", icon: Smartphone },
  { name: "Technology", icon: Laptop },
  { name: "Maintenance", icon: Wrench },
  { name: "Fuel", icon: Fuel },
  { name: "Utilities", icon: Zap },
  { name: "Internet", icon: Wifi },
  { name: "Communication", icon: Phone },
  { name: "Money", icon: DollarSign },
  { name: "Investment", icon: TrendingUp },
  { name: "Business", icon: Briefcase },
  { name: "Savings", icon: PiggyBank },
  { name: "Banking", icon: CreditCard },
  { name: "Property", icon: Building },
  { name: "Family", icon: Users },
  { name: "School", icon: GraduationCap },
  { name: "Medical", icon: Stethoscope },
  { name: "Baby", icon: Baby },
  { name: "Nature", icon: TreePine },
  { name: "Garden", icon: Flower },
  { name: "Weather", icon: Sun },
  { name: "Climate", icon: Cloud },
  { name: "Protection", icon: Umbrella },
  { name: "Special", icon: Star },
];

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color = "#6B7280" }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  
  const selectedIcon = CATEGORY_ICONS.find(icon => icon.name === value);
  const IconComponent = selectedIcon?.icon || DollarSign;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-12 h-12 p-0"
          style={{ color }}
        >
          <IconComponent className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="grid grid-cols-6 gap-2">
          {CATEGORY_ICONS.map((iconItem) => {
            const Icon = iconItem.icon;
            return (
              <Button
                key={iconItem.name}
                variant="ghost"
                className={cn(
                  "w-12 h-12 p-0",
                  value === iconItem.name && "bg-muted"
                )}
                onClick={() => {
                  onChange(iconItem.name);
                  setOpen(false);
                }}
                style={{ color }}
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}