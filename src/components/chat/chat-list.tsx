
"use client";

// import { mockChats, mockUsers } from "@/lib/mock-data"; // Mock data deprecated
// import type { Chat } from "@/lib/types";
// import Link from "next/link";
// import { useParams, usePathname } from "next/navigation";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { cn } from "@/lib/utils";
// import { formatDistanceToNowStrict } from 'date-fns';
// import { PresenceIndicator } from "./presence-indicator";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "../ui/input";
import { Search, AlertTriangle } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function ChatList() {
  // const params = useParams();
  // const pathname = usePathname();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // const filteredChats = mockChats.filter(chat => { // Mock data deprecated
  //   const chatName = chat.isGroup ? chat.name : chat.participants.find(p => p.id !== currentUser?.id)?.name;
  //   return chatName?.toLowerCase().includes(searchTerm.toLowerCase());
  // });
  
  if (!currentUser) {
    // This part might not be hit if layout redirects, but as a safeguard
    return (
        <div className="flex h-full flex-col border-r bg-card p-4 items-center justify-center">
            <p className="text-muted-foreground">Please log in to see chats.</p>
        </div>
    );
  }

  // Placeholder content until ChatList is fully integrated with Firestore
  return (
    <div className="flex h-full flex-col border-r bg-card">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold tracking-tight">Conversations</h2>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search chats..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled // Disabled until Firestore integration
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Under Development</AlertTitle>
                <AlertDescription>
                    Chat list functionality is being upgraded to use live data from Firebase. 
                    Currently, please navigate to chats directly via URL (e.g., /chat/general).
                </AlertDescription>
            </Alert>
        </div>
        {/* 
        // Example structure for when Firestore data is available
        <nav className="flex flex-col gap-1 p-2">
          {filteredChats.length > 0 ? filteredChats.map((chat) => {
            // ... chat item rendering logic ...
          }) : (
            <p className="p-4 text-center text-sm text-muted-foreground">No chats found.</p>
          )}
        </nav> 
        */}
      </ScrollArea>
    </div>
  );
}
