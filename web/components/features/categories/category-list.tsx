import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, FolderOpen } from "lucide-react";
import type { CategorySummary } from "@/lib/api";

interface CategoryListProps {
  categories: CategorySummary[];
  emptyMessage?: string;
}

export function CategoryList({ categories, emptyMessage = "No categories yet." }: CategoryListProps) {
  const incomeCategories = categories.filter(cat => cat.kind === "income");
  const expenseCategories = categories.filter(cat => cat.kind === "expense");

  if (!categories.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">No categories yet</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            {emptyMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Income Categories */}
      {incomeCategories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Income Categories
              <Badge variant="outline" className="ml-auto">
                {incomeCategories.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {incomeCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50/50 hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="font-medium text-green-900">{category.name}</span>
                </div>
                <Badge variant="outline" className="border-green-300 text-green-700 bg-green-100">
                  Income
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Expense Categories */}
      {expenseCategories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Expense Categories
              <Badge variant="outline" className="ml-auto">
                {expenseCategories.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenseCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="font-medium text-red-900">{category.name}</span>
                </div>
                <Badge variant="outline" className="border-red-300 text-red-700 bg-red-100">
                  Expense
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
