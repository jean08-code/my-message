
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function RootPage() {
  const router = useRouter();
  const { loading } = useAuth(); // User object no longer needed for initial redirect decision

  useEffect(() => {
    if (!loading) {
      // Always redirect to /chat, whether logged in or guest
      router.replace('/chat');
    }
  }, [loading, router]);

  // Show a loading state while auth is being checked or redirect is happening
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

  return null; // Redirect will handle it
}
