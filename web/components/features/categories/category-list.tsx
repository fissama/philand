import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategorySummary } from "@/lib/api";

interface CategoryListProps {
  categories: CategorySummary[];
  emptyMessage?: string;
}

export function CategoryList({ categories, emptyMessage = "No categories yet." }: CategoryListProps) {
  if (!categories.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {categories.map((category) => (
        <Card key={category.id} className="border-border">
          <CardContent className="flex items-center justify-between py-4">
            <span className="font-medium">{category.name}</span>
            <Badge variant={category.kind === "income" ? "default" : "secondary"}>
              {category.kind === "income" ? "Income" : "Expense"}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
