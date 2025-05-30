// src/app/(app)/page.tsx
import { redirect } from 'next/navigation';

export default function AppRootPage() {
  redirect('/chat');
  // Next.js handles this as a server-side redirect.
  // No need to return null explicitly unless for specific linters or type checking,
  // but redirect() itself throws an error that Next.js catches to perform the redirect.
}
