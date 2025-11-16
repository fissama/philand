"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { TrendingUp, TrendingDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ColorPicker } from "./color-picker";
import { IconPicker } from "./icon-picker";
import type { CategorySummary, CategoryKind } from "@/lib/api";

const categoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  kind: z.enum(["income", "expense"] as const),
  color: z.string().optional(),
  icon: z.string().optional(),
  is_hidden: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  category?: CategorySummary;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

const DEFAULT_COLORS = {
  income: "#22C55E",
  expense: "#EF4444",
};

const DEFAULT_ICONS = {
  income: "TrendingUp",
  expense: "ShoppingCart",
};

export function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading = false,
  title,
  description
}: CategoryFormProps) {
  const t = useTranslations();
  
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      kind: category?.kind || "expense",
      color: category?.color || DEFAULT_COLORS.expense,
      icon: category?.icon || DEFAULT_ICONS.expense,
      is_hidden: category?.is_hidden || false,
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  const watchedKind = watch("kind");
  const watchedColor = watch("color");
  const watchedIcon = watch("icon");
  const watchedHidden = watch("is_hidden");

  const handleKindChange = (kind: CategoryKind) => {
    setValue("kind", kind);
    // Update default color and icon when kind changes (only if not editing existing category)
    if (!category) {
      setValue("color", DEFAULT_COLORS[kind]);
      setValue("icon", DEFAULT_ICONS[kind]);
    }
  };

  const onFormSubmit = async (data: CategoryFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ 
              backgroundColor: `${watchedColor}20`,
              color: watchedColor 
            }}
          >
            {watchedKind === "income" ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          </div>
          <div>
            <CardTitle className="text-xl">
              {title || (category ? t('category.editCategory') : t('category.createCategory'))}
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Category Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('entry.type')}</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={watchedKind === "income" ? "default" : "outline"}
                className={cn(
                  "h-12 justify-start gap-3 transition-all",
                  watchedKind === "income" && "bg-green-600 hover:bg-green-700 text-white"
                )}
                onClick={() => handleKindChange("income")}
              >
                <TrendingUp className="h-4 w-4" />
                {t('entry.income')}
              </Button>
              <Button
                type="button"
                variant={watchedKind === "expense" ? "default" : "outline"}
                className={cn(
                  "h-12 justify-start gap-3 transition-all",
                  watchedKind === "expense" && "bg-red-600 hover:bg-red-700 text-white"
                )}
                onClick={() => handleKindChange("expense")}
              >
                <TrendingDown className="h-4 w-4" />
                {t('entry.expense')}
              </Button>
            </div>
          </div>

          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">
              {t('category.name')}
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={watchedKind === "income" ? "Salary, Freelance, etc." : "Groceries, Gas, etc."}
              className={cn("h-12 text-base", errors.name && "border-red-500")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Color and Icon */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">{t('category.color')}</Label>
              <ColorPicker
                value={watchedColor}
                onChange={(color) => setValue("color", color)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">{t('category.icon')}</Label>
              <IconPicker
                value={watchedIcon}
                onChange={(icon) => setValue("icon", icon)}
                color={watchedColor}
              />
            </div>
          </div>

          {/* Hidden Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">{t('category.hidden')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('category.hiddenDescription')}
              </p>
            </div>
            <Switch
              checked={watchedHidden}
              onCheckedChange={(checked) => setValue("is_hidden", checked)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 h-12"
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex-1 h-12 font-medium",
                watchedKind === "income" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {category ? "Updating..." : "Creating..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {watchedKind === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {category ? t('common.update') : t('common.create')}
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}