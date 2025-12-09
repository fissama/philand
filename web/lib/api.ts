"use client";

import { getThemeAwareToast } from "@/lib/toast";
import { authStore } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

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

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  return request(path, options);
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
    const toast = getThemeAwareToast();
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
  googleAuth: (code: string) =>
    request<{ token: string; user: UserProfile }>("/auth/google", {
      method: "POST",
      body: { code }
    }),
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
  profile: {
    get: () => request<UserProfile>("/api/profile"),
    update: (input: UpdateProfileReq) =>
      request<UserProfile>("/api/profile", {
        method: "PATCH",
        body: input
      }),
    uploadAvatar: (input: UploadAvatarReq) =>
      request<AvatarResponse>("/api/profile/avatar", {
        method: "POST",
        body: input
      }),
    deleteAvatar: () =>
      request<AvatarResponse>("/api/profile/avatar", {
        method: "DELETE"
      })
  },
  budgets: {
    list: (query?: string) => {
      const params = query ? `?query=${encodeURIComponent(query)}` : "";
      return request<BudgetSummary[]>(`/api/budgets${params}`);
    },
    create: (input: { name: string; currency: string; budget_type?: BudgetType }) =>
      request<BudgetSummary>("/api/budgets", { 
        method: "POST", 
        body: { name: input.name, currency_code: input.currency, budget_type: input.budget_type } 
      }),
    detail: (id: string) => request<BudgetDetail>(`/api/budgets/${id}`),
    balance: (id: string) => request<BudgetBalance>(`/api/budgets/${id}/balance`),
    update: (id: string, input: UpdateBudgetReq) =>
      request<BudgetDetail>(`/api/budgets/${id}`, {
        method: "PATCH",
        body: input
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/budgets/${id}`, {
        method: "DELETE"
      })
  },
  categories: {
    list: (budgetId: string) => request<CategorySummary[]>(`/api/budgets/${budgetId}/categories`),
    create: (budgetId: string, input: { name: string; kind: CategoryKind; color?: string; icon?: string; is_hidden?: boolean }) =>
      request<CategorySummary>(`/api/budgets/${budgetId}/categories`, {
        method: "POST",
        body: input
      }),
    get: (budgetId: string, categoryId: string) =>
      request<CategorySummary>(`/api/budgets/${budgetId}/categories/${categoryId}`),
    update: (budgetId: string, categoryId: string, input: { name?: string; color?: string; icon?: string; is_hidden?: boolean }) =>
      request<CategorySummary>(`/api/budgets/${budgetId}/categories/${categoryId}`, {
        method: "PATCH",
        body: input
      }),
    delete: (budgetId: string, categoryId: string) =>
      request<{ message: string }>(`/api/budgets/${budgetId}/categories/${categoryId}`, {
        method: "DELETE"
      })
  },
  entries: {
    list: (
      budgetId: string,
      params: {
        page?: number;
        perPage?: number;
        kind?: CategoryKind | "all";
        from?: string;
        to?: string;
        categoryId?: string;
        search?: string;
        sortBy?: "date" | "amount" | "description";
        sortOrder?: "asc" | "desc";
        memberId?: string;
      }
    ) => {
      // Convert camelCase to snake_case for backend
      const queryParams: Record<string, string> = {};
      if (params.kind && params.kind !== "all") queryParams.kind = params.kind;
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;
      if (params.categoryId) queryParams.category_id = params.categoryId;
      if (params.search) queryParams.search = params.search;
      if (params.sortBy) queryParams.sort_by = params.sortBy;
      if (params.sortOrder) queryParams.sort_order = params.sortOrder;
      if (params.page) queryParams.page = String(params.page);
      if (params.perPage) queryParams.per_page = String(params.perPage);
      if (params.memberId) queryParams.member_id = params.memberId;
      
      return request<Entry[]>(`/api/budgets/${budgetId}/entries?${new URLSearchParams(queryParams).toString()}`);
    },
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
        body: {
          amount_minor: Math.round(input.amount * 100),
          entry_date: input.occurredOn,
          kind: input.kind,
          description: input.note,
          category_id: input.categoryId
        }
      }),
    update: (
      budgetId: string,
      entryId: string,
      input: {
        amount?: number;
        occurredOn?: string;
        kind?: CategoryKind;
        note?: string;
        categoryId?: string;
      }
    ) =>
      request<Entry>(`/api/budgets/${budgetId}/entries/${entryId}`, {
        method: "PATCH",
        body: {
          ...(input.amount !== undefined && { amount_minor: Math.round(input.amount * 100) }),
          ...(input.occurredOn && { entry_date: input.occurredOn }),
          ...(input.kind && { kind: input.kind }),
          ...(input.note !== undefined && { description: input.note }),
          ...(input.categoryId !== undefined && { category_id: input.categoryId })
        }
      }),
    delete: (budgetId: string, entryId: string) =>
      request<{ message: string }>(`/api/budgets/${budgetId}/entries/${entryId}`, {
        method: "DELETE"
      })
  },
  summary: {
    monthly: async (budgetId: string, params?: { from?: string; to?: string }) => {
      const queryString = params
        ? `?${new URLSearchParams(
            Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
              if (value !== undefined && value !== "") {
                acc[key] = String(value);
              }
              return acc;
            }, {})
          ).toString()}`
        : "";
      const data = await request<Array<{
        month_start: string;
        income_minor: number;
        expense_minor: number;
        net_minor: number;
      }>>(`/api/budgets/${budgetId}/summary/monthly${queryString}`);
      
      // Transform backend response to include computed properties
      return data.map((item) => ({
        ...item,
        month: item.month_start,
        income: item.income_minor / 100,
        expense: item.expense_minor / 100,
        net: item.net_minor / 100
      }));
    }
  },
  members: {
    list: (budgetId: string) => request<Member[]>(`/api/budgets/${budgetId}/members`),
    create: (budgetId: string, input: { email: string; role: Role }) =>
      request<Member>(`/api/budgets/${budgetId}/members`, { method: "POST", body: input }),
    update: (budgetId: string, memberId: string, input: { role: Role }) =>
      request<Member>(`/api/budgets/${budgetId}/members/${memberId}`, { method: "PATCH", body: input }),
    remove: (budgetId: string, memberId: string) =>
      request<Response>(`/api/budgets/${budgetId}/members/${memberId}`, { method: "DELETE", raw: true })
  },
  transfers: {
    create: (input: {
      from_budget_id: string;
      to_budget_id: string;
      amount: number;
      transfer_date: string;
      currency_code: string;
      note?: string;
      from_category_id: string;
      to_category_id: string;
    }) =>
      request<{
        transfer: {
          id: string;
          from_budget_id: string;
          to_budget_id: string;
          amount_minor: number;
          currency_code: string;
          transfer_date: string;
          note: string | null;
          created_by: string;
          created_at: string;
        };
        from_entry_id: string;
        to_entry_id: string;
        from_budget_name: string;
        to_budget_name: string;
      }>('/api/transfers', {
        method: 'POST',
        body: {
          ...input,
          amount_minor: Math.round(input.amount * 100)
        }
      })
  }
};

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  bio?: string;
  timezone: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileReq {
  name?: string;
  bio?: string;
  timezone?: string;
  locale?: string;
}

export interface UploadAvatarReq {
  avatar: string; // base64 encoded image
}

export interface AvatarResponse {
  avatar_url: string;
  message: string;
}

export type Role = "owner" | "manager" | "contributor" | "viewer";

export type BudgetType = "standard" | "saving" | "debt" | "invest" | "sharing";

export interface BudgetSummary {
  id: string;
  name: string;
  currency_code: string;
  budget_type: BudgetType;
  owner_id: string;
  description?: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  user_role: Role;
  totalIncome?: number;
  totalExpense?: number;
}

export interface BudgetDetail extends BudgetSummary {
  // Categories are fetched separately via api.categories.list()
}

export interface BudgetBalance {
  income: number;
  expense: number;
  net: number;
  currency_code: string;
}

export interface UpdateBudgetReq {
  name?: string;
  description?: string;
  currency_code?: string;
  budget_type?: BudgetType;
  archived?: boolean;
}

export type Budget = BudgetDetail;

export type CategoryKind = "income" | "expense";

export interface CategorySummary {
  id: string;
  name: string;
  kind: CategoryKind;
  is_hidden: boolean;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Entry {
  id: string;
  budget_id: string;
  category_id: string;
  kind: CategoryKind;
  amount_minor: number;
  currency_code: string;
  entry_date: string;
  description?: string;
  counterparty?: string;
  created_by: string;
  created_at: string;
  // Member information
  member_name: string;
  member_email: string;
  member_avatar?: string;
  // Comments and attachments
  comment_count?: number;
  attachment_count?: number;
  category_name?: string;
}

export interface EntryListResponse {
  data: Entry[];
  page: number;
  pageCount: number;
}

export interface MonthlySummary {
  month_start: string;
  income_minor: number;
  expense_minor: number;
  net_minor: number;
  // Computed properties for convenience
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface Member {
  budget_id: string;
  user_id: string;
  user_name?: string;
  user_email: string;
  role: Role;
  avatar?: string;
}