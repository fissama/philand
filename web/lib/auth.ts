"use client";

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { UserProfile } from "@/lib/api";
import { encrypt, decrypt } from "@/lib/crypto";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  setAuth: (payload: { token: string; user: UserProfile }) => void;
  updateUser: (user: Partial<UserProfile>) => void;
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

/**
 * Encrypted localStorage adapter for Zustand
 */
const encryptedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof globalThis.window === "undefined") return null;
    
    const encrypted = localStorage.getItem(name);
    if (!encrypted) return null;
    
    try {
      return decrypt(encrypted);
    } catch (error) {
      console.error("Failed to decrypt auth data:", error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof globalThis.window === "undefined") return;
    
    try {
      const encrypted = encrypt(value);
      localStorage.setItem(name, encrypted);
    } catch (error) {
      console.error("Failed to encrypt auth data:", error);
      // Fallback to unencrypted storage
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof globalThis.window === "undefined") return;
    localStorage.removeItem(name);
  }
};

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: ({ token, user }) => set({ token, user }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      clearAuth: () => set({ token: null, user: null })
    }),
    {
      name: "philand-auth",
      storage: createJSONStorage(() => (typeof window === "undefined" ? noopStorage : encryptedStorage))
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
    if (typeof globalThis.window === "undefined") return;
    
    // Wait for hydration to complete before checking auth
    const timer = setTimeout(() => {
      if (!token) {
        router.replace("/login");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router, token]);
}
