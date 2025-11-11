"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { UserProfile } from "@/lib/api";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  setAuth: (payload: { token: string; user: UserProfile }) => void;
  clearAuth: () => void;
}

const noopStorage: Storage = {
  get length() {
    return 0;
  },
  clear: () => undefined,
  getItem: () => null,
  key: () => null,
  removeItem: (_key: string) => undefined,
  setItem: (_key: string, _value: string) => undefined
};

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: ({ token, user }) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null })
    }),
    {
      name: "philand-auth",
      storage: createJSONStorage(() => (typeof window === "undefined" ? noopStorage : sessionStorage))
    }
  )
);

export function useAuth() {
  return authStore();
}

export function useAuthGuard() {
  const router = useRouter();
  const { token } = authStore();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);
}
