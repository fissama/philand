import React from "react";
import { 
  Home, Car, ShoppingCart, Utensils, Coffee, Gamepad2, 
  Heart, Plane, Gift, Music, Book, Dumbbell, Shirt, 
  Smartphone, Laptop, Wrench, Fuel, Zap, Wifi, Phone,
  DollarSign, TrendingUp, Briefcase, PiggyBank, CreditCard,
  Building, Users, GraduationCap, Stethoscope, Baby,
  TreePine, Flower, Sun, Cloud, Umbrella, Star,
  ShoppingBag, Pizza, Sandwich, Wine, Beer, Popcorn,
  Film, Tv, Headphones, Camera, Palette, Brush,
  Scissors, Watch, Glasses, Footprints, Bike, Bus,
  Train, Ship, Rocket, MapPin, Compass, Globe,
  Mail, MessageCircle, Bell, Calendar, Clock, Timer,
  Award, Trophy, Target, Flag, Bookmark, Tag,
  Package, Box, Archive, Folder, FileText, Newspaper,
  Search, Filter, Settings, Hammer, Paintbrush
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  // Finance & Money
  Money: DollarSign,
  Investment: TrendingUp,
  Savings: PiggyBank,
  Banking: CreditCard,
  Business: Briefcase,
  
  // Home & Living
  Home,
  Property: Building,
  Utilities: Zap,
  Internet: Wifi,
  Maintenance: Wrench,
  Hammer,
  
  // Shopping & Food
  Shopping: ShoppingCart,
  ShoppingCart,
  ShoppingBag,
  Food: Utensils,
  Pizza,
  Sandwich,
  Coffee,
  Wine,
  Beer,
  Package,
  Box,
  
  // Entertainment
  Entertainment: Gamepad2,
  Film,
  Tv,
  Music,
  Headphones,
  Popcorn,
  Camera,
  
  // Health & Fitness
  Health: Heart,
  Medical: Stethoscope,
  Fitness: Dumbbell,
  
  // Transportation
  Car,
  Fuel,
  Bike,
  Bus,
  Train,
  Plane,
  Ship,
  Rocket,
  
  // Travel & Location
  Travel: MapPin,
  Compass,
  Globe,
  
  // Fashion & Personal
  Clothing: Shirt,
  Watch,
  Glasses,
  Footprints,
  Scissors,
  
  // Technology
  Phone: Smartphone,
  Technology: Laptop,
  Communication: Phone,
  
  // Education & Work
  Education: Book,
  School: GraduationCap,
  
  // Family & Social
  Family: Users,
  Baby,
  Gifts: Gift,
  
  // Nature & Weather
  Nature: TreePine,
  Garden: Flower,
  Weather: Sun,
  Climate: Cloud,
  Protection: Umbrella,
  
  // Communication
  Mail,
  Message: MessageCircle,
  Bell,
  
  // Organization
  Calendar,
  Clock,
  Timer,
  Archive,
  Folder,
  FileText,
  Newspaper,
  Bookmark,
  Tag,
  
  // Achievement
  Award,
  Trophy,
  Target,
  Flag,
  Star,
  Special: Star,
  
  // Creative
  Palette,
  Brush,
  Paintbrush,
  
  // Utility
  Search,
  Filter,
  Settings,
  
  // Aliases for backward compatibility
  TrendingUp,
};

interface CategoryIconProps {
  icon?: string;
  color?: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ icon, color = "#6B7280", size = 20, className }: CategoryIconProps) {
  const IconComponent = icon && ICON_MAP[icon as keyof typeof ICON_MAP] ? ICON_MAP[icon as keyof typeof ICON_MAP] : DollarSign;
  
  return (
    <IconComponent 
      className={className} 
      style={{ color, width: size, height: size }} 
    />
  );
}