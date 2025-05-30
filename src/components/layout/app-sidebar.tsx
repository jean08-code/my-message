"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { MessageSquare, Settings, Users, ChevronLeftSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../theme-toggle"; // If putting theme toggle in sidebar footer
import { Button } from "../ui/button";
import { useSidebar } from "@/components/ui/sidebar"; // To get toggleSidebar for custom button

export function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state: sidebarState } = useSidebar();

  const navItems = [
    { href: "/chat", label: "Chats", icon: MessageSquare },
    // { href: "/contacts", label: "Contacts", icon: Users }, // Example for future
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 justify-between items-center">
          <Link href="/chat" className="flex items-center gap-2 text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
            <MessageSquare className="h-7 w-7" />
            <span>RippleChat</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="group-data-[collapsible=icon]:hidden">
            <ChevronLeftSquare />
          </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side:"right" }}
                  aria-label={item.label}
                >
                  <item.icon />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {/* <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
        <ThemeToggle />
      </SidebarFooter> */}
    </Sidebar>
  );
}
