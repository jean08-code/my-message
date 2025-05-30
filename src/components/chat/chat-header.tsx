"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PresenceIndicator } from "./presence-indicator";
import type { UserStatus } from "@/lib/types";
import { ArrowLeft, Info, Phone, Video } from "lucide-react";
import Link from "next/link";

interface ChatHeaderProps {
  chatId: string;
  name: string;
  avatarUrl?: string;
  status: UserStatus | 'group' | string; // string for participant count
  participantCount?: number;
  isGroup: boolean;
}

export function ChatHeader({ name, avatarUrl, status, participantCount, isGroup }: ChatHeaderProps) {
  const fallbackName = name ? name.substring(0, 2).toUpperCase() : "??";
  
  return (
    <div className="flex items-center justify-between border-b p-3.5 bg-card shadow-sm">
      <div className="flex items-center gap-3">
        <Link href="/chat" className="md:hidden">
          <Button variant="ghost" size="icon" aria-label="Back to chat list">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="relative">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={avatarUrl} alt={name} data-ai-hint="user avatar group" />
            <AvatarFallback>{fallbackName}</AvatarFallback>
          </Avatar>
          {!isGroup && status !== 'group' && (
             <PresenceIndicator status={status as UserStatus} className="absolute bottom-0 right-0" />
          )}
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{name}</h2>
          <p className="text-xs text-muted-foreground">
            {isGroup ? `${participantCount} members` : status.charAt(0).toUpperCase() + status.slice(1)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Call">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Video call">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Chat info">
          <Info className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
