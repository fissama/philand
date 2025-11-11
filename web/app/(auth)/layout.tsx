import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card/90 p-8 shadow-xl backdrop-blur">
        {children}
      </div>
    </div>
  );
}
