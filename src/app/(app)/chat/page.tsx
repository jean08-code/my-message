
// src/app/(app)/chat/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

// This page now serves as a clearer entry point or redirect manager for the chat section.
export default function RootChatPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If user is logged in, redirect to a default chat room, e.g., 'general'
        // This helps avoid showing an empty page if ChatList is not yet functional with Firestore.
        router.replace('/chat/general'); 
      } else {
        // If no user and not loading, redirect to login, ensuring they pass through auth.
        router.replace('/login?redirect=/chat/general');
      }
    }
  }, [user, loading, router]);

  // Show a loading state while auth is being checked or redirect is happening
  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-4 text-center">
        <Skeleton className="h-20 w-20 rounded-full mb-6" />
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }
  
  // Fallback content if redirect somehow doesn't happen immediately or for other states
  return (
     <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-4 text-center">
        <p>Loading chat...</p>
      </div>
  );
}
