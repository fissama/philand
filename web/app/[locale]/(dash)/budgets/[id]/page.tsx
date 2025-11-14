import { redirect } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default function BudgetIndexPage({ params }: PageProps) {
  redirect(`/budgets/${params.id}/overview`);
}
