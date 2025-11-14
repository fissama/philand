import { 
  Home, Car, ShoppingCart, Utensils, Coffee, Gamepad2, 
  Heart, Plane, Gift, Music, Book, Dumbbell, Shirt, 
  Smartphone, Laptop, Wrench, Fuel, Zap, Wifi, Phone,
  DollarSign, TrendingUp, Briefcase, PiggyBank, CreditCard,
  Building, Users, GraduationCap, Stethoscope, Baby,
  TreePine, Flower, Sun, Cloud, Umbrella, Star
} from "lucide-react";

const ICON_MAP = {
  Home, Car, Shopping: ShoppingCart, Food: Utensils, Coffee, Entertainment: Gamepad2,
  Health: Heart, Travel: Plane, Gifts: Gift, Music, Education: Book, Fitness: Dumbbell,
  Clothing: Shirt, Phone: Smartphone, Technology: Laptop, Maintenance: Wrench, Fuel,
  Utilities: Zap, Internet: Wifi, Communication: Phone, Money: DollarSign,
  Investment: TrendingUp, Business: Briefcase, Savings: PiggyBank, Banking: CreditCard,
  Property: Building, Family: Users, School: GraduationCap, Medical: Stethoscope,
  Baby, Nature: TreePine, Garden: Flower, Weather: Sun, Climate: Cloud,
  Protection: Umbrella, Special: Star, TrendingUp, ShoppingCart
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