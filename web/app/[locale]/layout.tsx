import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

import "@/app/globals.css";

import { AppProviders } from "@/components/providers";
import { locales } from '@/i18n';
import { getAppName, getAppVersion } from '@/lib/version';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${getAppName()}`,
  description: "Modern budget tracking and financial management dashboard",
  icons: {
    icon: "/philand.png",
    apple: "/philand.png"
  }
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
