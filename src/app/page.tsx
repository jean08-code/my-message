
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // This component will redirect to the /chat route.
    router.replace('/chat');
  }, [router]);

  // Render nothing, since the redirect is happening.
  // A loading indicator could be placed here if the redirect was slow.
  return null;
}
