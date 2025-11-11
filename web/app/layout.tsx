import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";

import { AppProviders } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Philand",
  description: "Modern Philand budgeting dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}> 
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
