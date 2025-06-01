
"use client";

import React from 'react';
// Removed useRouter and useEffect for redirecting to /login
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth(); // We only need loading state here

  // If still loading auth state, show a full-screen skeleton
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
    );
  }
  
  // If not loading, render the app layout.
  // Child components will handle whether a user is logged in or a guest.
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
