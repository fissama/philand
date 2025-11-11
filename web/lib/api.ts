"use client";

import { toast } from "sonner";

import { authStore } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  raw?: boolean;
}

interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

async function request<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { method = "GET", body, headers, raw } = options;
  const state = authStore.getState();
  const token = state.token;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include"
  });

  if (response.status === 401 || response.status === 403) {
    state.clearAuth();
    toast.error("You have been signed out", {
      description: "Please log in again to continue."
    });
  }

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch (error) {
      details = undefined;
    }
    const error: ApiError = new Error(response.statusText);
    error.status = response.status;
    error.details = details;
    throw error;
  }

  if (raw) {
    return response as unknown as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const api = {
  signup: (input: {
    email: string;
    password: string;
    name: string;
  }) => request<{ token: string; user: UserProfile }>("/auth/signup", { method: "POST", body: input }),
  login: (input: { email: string; password: string }) =>
    request<{ token: string; user: UserProfile }>("/auth/login", { method: "POST", body: input }),
  logout: () => {
    authStore.getState().clearAuth();
  },
  forgotEmail: (input: { email: string }) =>
    request<{ message: string }>("/auth/forgot/email", { method: "POST", body: input }),
  forgotOtp: (input: { email: string; otp: string }) =>
    request<{ token: string }>("/auth/forgot/otp", { method: "POST", body: input }),
  resetPassword: (input: { token: string; password: string }) =>
    request<{ message: string }>("/auth/reset", { method: "POST", body: input }),
  health: () => request<{ status: string }>("/healthz"),
  budgets: {
    list: () => request<BudgetSummary[]>("/api/budgets"),
    create: (input: { name: string; currency: string }) =>
      request<BudgetSummary>("/api/budgets", { method: "POST", body: input }),
    detail: (id: string) => request<BudgetDetail>(`/api/budgets/${id}`)
  },
  categories: {
    list: (budgetId: string) => request<CategorySummary[]>(`/api/budgets/${budgetId}/categories`),
    create: (budgetId: string, input: { name: string; kind: CategoryKind }) =>
      request<CategorySummary>(`/api/budgets/${budgetId}/categories`, {
        method: "POST",
        body: input
      })
  },
  entries: {
    list: (
      budgetId: string,
      params: {
        page?: number;
        kind?: CategoryKind | "all";
        from?: string;
        to?: string;
        categoryId?: string;
      }
    ) =>
      request<EntryListResponse>(`/api/budgets/${budgetId}/entries?${new URLSearchParams(
        Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
          if (value !== undefined && value !== "") {
            acc[key] = String(value);
          }
          return acc;
        }, {})
      ).toString()}`),
    create: (
      budgetId: string,
      input: {
        amount: number;
        occurredOn: string;
        kind: CategoryKind;
        note?: string;
        categoryId?: string;
      }
    ) =>
      request<Entry>(`/api/budgets/${budgetId}/entries`, {
        method: "POST",
        body: input
      })
  },
  summary: {
    monthly: (budgetId: string) => request<MonthlySummary[]>(`/api/budgets/${budgetId}/summary/monthly`)
  },
  members: {
    list: (budgetId: string) => request<Member[]>(`/api/budgets/${budgetId}/members`),
    create: (budgetId: string, input: { email: string; role: Role }) =>
      request<Member>(`/api/budgets/${budgetId}/members`, { method: "POST", body: input }),
    update: (budgetId: string, memberId: string, input: { role: Role }) =>
      request<Member>(`/api/budgets/${budgetId}/members/${memberId}`, { method: "PATCH", body: input }),
    remove: (budgetId: string, memberId: string) =>
      request<Response>(`/api/budgets/${budgetId}/members/${memberId}`, { method: "DELETE", raw: true })
  }
};

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export type Role = "Owner" | "Manager" | "Contributor" | "Viewer";

export interface BudgetSummary {
  id: string;
  name: string;
  currency: string;
  owner: string;
  totalIncome: number;
  totalExpense: number;
}

export interface BudgetDetail extends BudgetSummary {
  categories: CategorySummary[];
}

export type CategoryKind = "income" | "expense";

export interface CategorySummary {
  id: string;
  name: string;
  kind: CategoryKind;
}

export interface Entry {
  id: string;
  amount: number;
  occurredOn: string;
  kind: CategoryKind;
  note?: string;
  category?: CategorySummary;
}

export interface EntryListResponse {
  data: Entry[];
  page: number;
  pageCount: number;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface Member {
  id: string;
  email: string;
  role: Role;
}
