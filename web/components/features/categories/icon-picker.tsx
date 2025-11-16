"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { 
  Home, Car, ShoppingCart, Utensils, Coffee, Gamepad2, 
  Heart, Plane, Gift, Music, Book, Dumbbell, Shirt, 
  Smartphone, Laptop, Wrench, Fuel, Zap, Wifi, Phone,
  DollarSign, TrendingUp, Briefcase, PiggyBank, CreditCard,
  Building, Users, GraduationCap, Stethoscope, Baby,
  TreePine, Flower, Sun, Cloud, Umbrella, Star, Check,
  ShoppingBag, Pizza, Sandwich, Wine, Beer, Popcorn,
  Film, Tv, Headphones, Camera, Palette, Brush,
  Scissors, Watch, Glasses, Footprints, Bike, Bus,
  Train, Ship, Rocket, MapPin, Compass, Globe,
  Mail, MessageCircle, Bell, Calendar, Clock, Timer,
  Award, Trophy, Target, Flag, Bookmark, Tag,
  Package, Box, Archive, Folder, FileText, Newspaper,
  Search, Filter, Settings, Hammer, Paintbrush
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS = [
  // Finance & Money
  { name: "Money", icon: DollarSign, category: "finance" },
  { name: "Investment", icon: TrendingUp, category: "finance" },
  { name: "Savings", icon: PiggyBank, category: "finance" },
  { name: "Banking", icon: CreditCard, category: "finance" },
  { name: "Business", icon: Briefcase, category: "finance" },
  
  // Home & Living
  { name: "Home", icon: Home, category: "home" },
  { name: "Property", icon: Building, category: "home" },
  { name: "Utilities", icon: Zap, category: "home" },
  { name: "Internet", icon: Wifi, category: "home" },
  { name: "Maintenance", icon: Wrench, category: "home" },
  { name: "Hammer", icon: Hammer, category: "home" },
  
  // Shopping & Food
  { name: "Shopping", icon: ShoppingCart, category: "shopping" },
  { name: "ShoppingBag", icon: ShoppingBag, category: "shopping" },
  { name: "Food", icon: Utensils, category: "shopping" },
  { name: "Pizza", icon: Pizza, category: "shopping" },
  { name: "Sandwich", icon: Sandwich, category: "shopping" },
  { name: "Coffee", icon: Coffee, category: "shopping" },
  { name: "Wine", icon: Wine, category: "shopping" },
  { name: "Beer", icon: Beer, category: "shopping" },
  { name: "Package", icon: Package, category: "shopping" },
  { name: "Box", icon: Box, category: "shopping" },
  
  // Entertainment
  { name: "Entertainment", icon: Gamepad2, category: "entertainment" },
  { name: "Film", icon: Film, category: "entertainment" },
  { name: "Tv", icon: Tv, category: "entertainment" },
  { name: "Music", icon: Music, category: "entertainment" },
  { name: "Headphones", icon: Headphones, category: "entertainment" },
  { name: "Popcorn", icon: Popcorn, category: "entertainment" },
  { name: "Camera", icon: Camera, category: "entertainment" },
  
  // Health & Fitness
  { name: "Health", icon: Heart, category: "health" },
  { name: "Medical", icon: Stethoscope, category: "health" },
  { name: "Fitness", icon: Dumbbell, category: "health" },
  
  // Transportation
  { name: "Car", icon: Car, category: "transport" },
  { name: "Fuel", icon: Fuel, category: "transport" },
  { name: "Bike", icon: Bike, category: "transport" },
  { name: "Bus", icon: Bus, category: "transport" },
  { name: "Train", icon: Train, category: "transport" },
  { name: "Plane", icon: Plane, category: "transport" },
  { name: "Ship", icon: Ship, category: "transport" },
  { name: "Rocket", icon: Rocket, category: "transport" },
  
  // Travel & Location
  { name: "Travel", icon: MapPin, category: "travel" },
  { name: "Compass", icon: Compass, category: "travel" },
  { name: "Globe", icon: Globe, category: "travel" },
  
  // Fashion & Personal
  { name: "Clothing", icon: Shirt, category: "personal" },
  { name: "Watch", icon: Watch, category: "personal" },
  { name: "Glasses", icon: Glasses, category: "personal" },
  { name: "Footprints", icon: Footprints, category: "personal" },
  { name: "Scissors", icon: Scissors, category: "personal" },
  
  // Technology
  { name: "Phone", icon: Smartphone, category: "tech" },
  { name: "Technology", icon: Laptop, category: "tech" },
  { name: "Communication", icon: Phone, category: "tech" },
  
  // Education & Work
  { name: "Education", icon: Book, category: "education" },
  { name: "School", icon: GraduationCap, category: "education" },
  
  // Family & Social
  { name: "Family", icon: Users, category: "social" },
  { name: "Baby", icon: Baby, category: "social" },
  { name: "Gifts", icon: Gift, category: "social" },
  
  // Nature & Weather
  { name: "Nature", icon: TreePine, category: "nature" },
  { name: "Garden", icon: Flower, category: "nature" },
  { name: "Weather", icon: Sun, category: "nature" },
  { name: "Climate", icon: Cloud, category: "nature" },
  { name: "Protection", icon: Umbrella, category: "nature" },
  
  // Communication
  { name: "Mail", icon: Mail, category: "communication" },
  { name: "Message", icon: MessageCircle, category: "communication" },
  { name: "Bell", icon: Bell, category: "communication" },
  
  // Organization
  { name: "Calendar", icon: Calendar, category: "organization" },
  { name: "Clock", icon: Clock, category: "organization" },
  { name: "Timer", icon: Timer, category: "organization" },
  { name: "Archive", icon: Archive, category: "organization" },
  { name: "Folder", icon: Folder, category: "organization" },
  { name: "FileText", icon: FileText, category: "organization" },
  { name: "Newspaper", icon: Newspaper, category: "organization" },
  { name: "Bookmark", icon: Bookmark, category: "organization" },
  { name: "Tag", icon: Tag, category: "organization" },
  
  // Achievement
  { name: "Award", icon: Award, category: "achievement" },
  { name: "Trophy", icon: Trophy, category: "achievement" },
  { name: "Target", icon: Target, category: "achievement" },
  { name: "Flag", icon: Flag, category: "achievement" },
  { name: "Star", icon: Star, category: "achievement" },
  
  // Creative
  { name: "Palette", icon: Palette, category: "creative" },
  { name: "Brush", icon: Brush, category: "creative" },
  { name: "Paintbrush", icon: Paintbrush, category: "creative" },
  
  // Utility
  { name: "Search", icon: Search, category: "utility" },
  { name: "Filter", icon: Filter, category: "utility" },
  { name: "Settings", icon: Settings, category: "utility" },
];

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  color?: string;
}

// Popular/preset icons for quick access
const PRESET_ICONS = [
  { name: "Money", icon: DollarSign },
  { name: "Shopping", icon: ShoppingCart },
  { name: "Food", icon: Utensils },
  { name: "Coffee", icon: Coffee },
  { name: "Car", icon: Car },
  { name: "Fuel", icon: Fuel },
  { name: "Home", icon: Home },
  { name: "Utilities", icon: Zap },
  { name: "Phone", icon: Smartphone },
  { name: "Internet", icon: Wifi },
  { name: "Entertainment", icon: Gamepad2 },
  { name: "Music", icon: Music },
  { name: "Health", icon: Heart },
  { name: "Fitness", icon: Dumbbell },
  { name: "Education", icon: Book },
  { name: "Travel", icon: Plane },
  { name: "Investment", icon: TrendingUp },
  { name: "Savings", icon: PiggyBank },
  { name: "Gifts", icon: Gift },
  { name: "Clothing", icon: Shirt },
];

export function IconPicker({ value, onChange, color = "#6B7280" }: IconPickerProps) {
  const t = useTranslations("category");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const selectedIcon = CATEGORY_ICONS.find(icon => icon.name === value);
  const IconComponent = selectedIcon?.icon || DollarSign;

  const filteredIcons = searchQuery
    ? CATEGORY_ICONS.filter(icon => 
        icon.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : CATEGORY_ICONS;

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-12 justify-start gap-3 px-3 border-2 hover:border-primary/50 transition-colors"
        >
          <div 
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ 
              backgroundColor: `${color}20`,
              color: color 
            }}
          >
            <IconComponent className="h-4 w-4" />
          </div>
          <span className="flex-1 text-left text-sm">{selectedIcon?.name || "Select icon"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          {/* Preset Icons Section */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Popular Icons</Label>
            <div className="grid grid-cols-10 gap-2">
              {PRESET_ICONS.map((iconItem) => {
                const Icon = iconItem.icon;
                const isSelected = value === iconItem.name;
                return (
                  <button
                    key={iconItem.name}
                    type="button"
                    title={iconItem.name}
                    className={cn(
                      "relative w-9 h-9 rounded-lg transition-all hover:scale-110",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      "flex items-center justify-center",
                      isSelected 
                        ? "bg-accent scale-105 ring-2 ring-primary" 
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => handleIconSelect(iconItem.name)}
                    style={{ color }}
                  >
                    <Icon className="h-4 w-4" />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                        <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Section */}
          <div className="pt-2 border-t">
            <Label className="text-sm font-medium mb-3 block">All Icons</Label>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder={t("searchIcons")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10"
              />
              
              <ScrollArea className="h-48">
                <div className="pr-3">
                  {filteredIcons.length > 0 ? (
                    <div className="grid grid-cols-10 gap-2">
                      {filteredIcons.map((iconItem) => {
                        const Icon = iconItem.icon;
                        const isSelected = value === iconItem.name;
                        return (
                          <button
                            key={iconItem.name}
                            type="button"
                            title={iconItem.name}
                            className={cn(
                              "relative w-9 h-9 rounded-lg transition-all hover:scale-110",
                              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                              "flex items-center justify-center",
                              isSelected 
                                ? "bg-accent scale-105 ring-2 ring-primary" 
                                : "hover:bg-accent/50"
                            )}
                            onClick={() => handleIconSelect(iconItem.name)}
                            style={{ color }}
                          >
                            <Icon className="h-4 w-4" />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                                <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      {t("noIconsFound")}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}