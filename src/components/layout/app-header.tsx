
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function AppHeader() {
  const { user } = useAuth(); // Get current user state

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Link href="/chat" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <MessageSquare className="h-7 w-7" />
          <span className="hidden sm:inline-block">RippleChat</span>
        </Link>
      </div>
      <div className="flex items-center gap-3">
        {user && ( // Only show if user is logged in
          <span className="text-sm text-muted-foreground hidden md:inline-block">
            Logged in as: <span className="font-medium text-foreground">{user.name}</span>
          </span>
        )}
        <ThemeToggle />
        {user && <UserNav />} {/* Only show UserNav if user is logged in */}
      </div>
    </header>
  );
}
