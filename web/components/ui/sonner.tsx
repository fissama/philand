"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="system"
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "rounded-xl bg-background border border-border shadow-lg",
          title: "font-semibold",
          description: "text-sm text-muted-foreground"
        }
      }}
    />
  );
}
