"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { getQueryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/lib/theme-provider";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  readonly children: ReactNode;
}

export function AppProviders({ children }: Readonly<ProvidersProps>) {
  const [queryClient] = useState(() => getQueryClient());
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={googleClientId || ""}>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster />
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
