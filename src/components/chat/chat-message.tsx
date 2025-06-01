
"use client";

import type { Message, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { mockUsers } from "@/lib/mock-data"; // For sender lookup
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, CheckCheck } from "lucide-react";

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

  const MessageStatusIndicator = () => {
    if (!isOwnMessage || !message.status) return null;

    const iconSize = "h-4 w-4"; // Equivalent to text-base or text-sm line height
    const commonClass = "text-muted-foreground";
    const readClass = "text-primary"; // Or text-blue-500 or similar for read status

    switch (message.status) {
      case 'sent':
        return <Check className={cn(iconSize, commonClass)} />;
      case 'delivered':
        return <CheckCheck className={cn(iconSize, commonClass)} />;
      case 'read':
        return <CheckCheck className={cn(iconSize, readClass)} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2 group",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 self-start border shrink-0">
          <AvatarImage src={senderAvatarUrl} alt={senderName} data-ai-hint="user avatar"/>
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col items-end", isOwnMessage ? "items-end" : "items-start")}>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "max-w-[70%] rounded-xl px-3.5 py-2.5 shadow-md relative", // Added relative for status indicator positioning
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
          <div className="flex items-center justify-end gap-1 mt-1 mr-1">
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.timestamp), "p")}
            </span>
            <MessageStatusIndicator />
          </div>
        )}
        {!isOwnMessage && (
           <span className="text-xs text-muted-foreground mt-1 ml-1">
              {format(new Date(message.timestamp), "p")}
            </span>
        )}
      </div>
       {isOwnMessage && (
        <Avatar className="h-8 w-8 self-start border shrink-0">
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="user avatar"/>
          <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
