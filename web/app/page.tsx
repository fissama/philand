"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStore } from '@/lib/auth';

export default function RootPage() {
  const router = useRouter();
  const { user } = authStore();

  useEffect(() => {
    if (user) {
      // If user is authenticated, redirect to dashboard
      router.replace('/en'); // This will go to the dashboard
    } else {
      // If user is not authenticated, redirect to docs
      router.replace('/en/docs');
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}