"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/lib/theme-provider";

export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme === "dark" ? "dark" : "light"}
      position="top-right"
      expand={true}
      richColors={false}
      closeButton={true}
      toastOptions={{
        classNames: {
          toast: `border shadow-lg ${
            theme === "colorful" 
              ? "colorful-toast rounded-2xl" 
              : "rounded-xl bg-background border-border"
          }`,
          title: "font-semibold",
          description: "text-sm opacity-90",
          closeButton: "bg-white/10 border-white/20 hover:bg-white/20 text-white",
          error: theme === "colorful" 
            ? "text-white" 
            : theme === "dark"
            ? "text-white"
            : "text-white",
          success: theme === "colorful"
            ? "text-white"
            : theme === "dark"
            ? "text-white"
            : "text-white",
          warning: theme === "colorful"
            ? "text-white"
            : theme === "dark"
            ? "text-white"
            : "text-white",
          info: theme === "colorful"
            ? "text-white"
            : theme === "dark"
            ? "text-white"
            : "text-white"
        },
        style: theme === "colorful" ? {
          borderRadius: "1.5rem",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
        } : {}
      }}
    />
  );
}
