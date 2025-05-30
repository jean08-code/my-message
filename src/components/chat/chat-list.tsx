"use client";

import { mockChats, mockUsers } from "@/lib/mock-data";
import type { Chat } from "@/lib/types";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNowStrict } from 'date-fns';
import { PresenceIndicator } from "./presence-indicator";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import React, { useState } from "react";

export function ChatList() {
  const params = useParams();
  const pathname = usePathname();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter chats based on search term (participants' names)
  const filteredChats = mockChats.filter(chat => {
    const chatName = chat.isGroup ? chat.name : chat.participants.find(p => p.id !== currentUser?.id)?.name;
    return chatName?.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  if (!currentUser) return null;


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
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {filteredChats.length > 0 ? filteredChats.map((chat) => {
            const otherParticipant = chat.isGroup ? null : chat.participants.find(p => p.id !== currentUser.id);
            const chatName = chat.isGroup ? chat.name : otherParticipant?.name;
            const avatarUrl = chat.isGroup ? `https://placehold.co/100x100.png?text=${chatName?.substring(0,1)}` : otherParticipant?.avatarUrl;
            const fallback = chatName ? chatName.substring(0, 2).toUpperCase() : "??";
            const isActive = params.chatId === chat.id || pathname === `/chat/${chat.id}`;

            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-accent/50 hover:text-accent-foreground",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                )}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={avatarUrl} alt={chatName || "Chat"} data-ai-hint="avatar user" />
                    <AvatarFallback>{fallback}</AvatarFallback>
                  </Avatar>
                  {!chat.isGroup && otherParticipant && (
                    <PresenceIndicator status={otherParticipant.status} className="absolute bottom-0 right-0" />
                  )}
                </div>
                <div className="flex-1 truncate">
                  <p className="font-medium text-foreground">{chatName}</p>
                  {chat.lastMessage && (
                    <p className={cn("text-xs truncate", isActive ? "text-primary/80" : "text-muted-foreground/80")}>
                      {chat.lastMessage.senderId === currentUser.id && "You: "}
                      {chat.lastMessage.text}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end text-xs">
                  {chat.lastMessage && (
                    <span className={cn(isActive ? "text-primary/70" : "text-muted-foreground/70")}>
                      {formatDistanceToNowStrict(new Date(chat.lastMessage.timestamp), { addSuffix: true })}
                    </span>
                  )}
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <Badge variant="default" className="mt-1 h-5 min-w-[20px] justify-center bg-accent text-accent-foreground">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          }) : (
            <p className="p-4 text-center text-sm text-muted-foreground">No chats found.</p>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
