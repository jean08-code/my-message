"use client";

import type { Message, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { mockUsers } from "@/lib/mock-data"; // For sender lookup
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatMessageItemProps {
  message: Message;
  currentUser: User;
}

export function ChatMessageItem({ message, currentUser }: ChatMessageItemProps) {
  const isOwnMessage = message.senderId === currentUser.id;
  const sender = mockUsers.find(u => u.id === message.senderId);

  const senderName = sender ? sender.name : "Unknown User";
  const senderAvatarUrl = sender ? sender.avatarUrl : undefined;
  const avatarFallback = senderName.substring(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "flex items-end gap-2 group",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 self-start border">
          <AvatarImage src={senderAvatarUrl} alt={senderName} data-ai-hint="user avatar"/>
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      )}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "max-w-[70%] rounded-xl px-3.5 py-2.5 shadow-md",
                isOwnMessage
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-card text-card-foreground border rounded-bl-none"
              )}
            >
              {!isOwnMessage && sender && (
                <p className="text-xs font-medium mb-0.5 text-muted-foreground">{sender.name}</p>
              )}
              <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent side={isOwnMessage ? "left" : "right"} className="text-xs">
            {format(new Date(message.timestamp), "Pp")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
       {isOwnMessage && (
        <Avatar className="h-8 w-8 self-start border">
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="user avatar"/>
          <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
