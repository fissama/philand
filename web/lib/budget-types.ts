import { Wallet, PiggyBank, CreditCard, TrendingUp, Users } from "lucide-react";
import type { BudgetType } from "./api";

export interface BudgetTypeInfo {
  value: BudgetType;
  labelKey: string;
  descriptionKey: string;
  icon: typeof Wallet;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const budgetTypes: BudgetTypeInfo[] = [
  {
    value: "standard",
    labelKey: "budget.typeStandard",
    descriptionKey: "budget.typeStandardDesc",
    icon: Wallet,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    value: "saving",
    labelKey: "budget.typeSaving",
    descriptionKey: "budget.typeSavingDesc",
    icon: PiggyBank,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
  },
  {
    value: "debt",
    labelKey: "budget.typeDebt",
    descriptionKey: "budget.typeDebtDesc",
    icon: CreditCard,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
  },
  {
    value: "invest",
    labelKey: "budget.typeInvest",
    descriptionKey: "budget.typeInvestDesc",
    icon: TrendingUp,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  {
    value: "sharing",
    labelKey: "budget.typeSharing",
    descriptionKey: "budget.typeSharingDesc",
    icon: Users,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
];

export function getBudgetTypeInfo(type: BudgetType): BudgetTypeInfo {
  return budgetTypes.find((t) => t.value === type) || budgetTypes[0];
}
