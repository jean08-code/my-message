"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context'; // Assuming useAuth provides loading state
import { Skeleton } from '@/components/ui/skeleton';

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/chat');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // Optional: Show a loading state while auth is being checked
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  return null; // Or a minimal loading indicator, redirect will handle it
}
