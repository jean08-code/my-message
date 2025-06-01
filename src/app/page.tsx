
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function RootPage() {
  const router = useRouter();
  const { loading, user } = useAuth(); 

  useEffect(() => {
    if (!loading) {
      // If user is loaded (either logged in or null), redirect to /chat.
      // The /chat route itself (or /chat/[chatId]) will handle further logic
      // like redirecting to login if necessary, or to a default chat room.
      router.replace('/chat');
    }
  }, [loading, user, router]);

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
