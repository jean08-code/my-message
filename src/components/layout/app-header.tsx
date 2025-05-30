"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export function AppHeader() {
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
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
