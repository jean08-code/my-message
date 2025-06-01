
"use client";

import type { Message, User, UserStatus } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { mockUsers } from "@/lib/mock-data"; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, CheckCheck } from "lucide-react";

interface ChatMessageItemProps {
  message: Message;
  currentUser: User; // This will be the effectiveUser (logged-in or guest)
}

export function ChatMessageItem({ message, currentUser }: ChatMessageItemProps) {
  const isOwnMessage = message.senderId === currentUser.id;

  // Determine sender details
  let sender: User | undefined | null = null;
  if (isOwnMessage) {
    sender = currentUser;
  } else {
    sender = mockUsers.find(u => u.id === message.senderId);
    // If sender is not in mockUsers and is a guest ID, create a temporary guest user object for display
    if (!sender && message.senderId.startsWith('guest-')) {
      sender = {
        id: message.senderId,
        name: "Guest",
        avatarUrl: `https://placehold.co/100x100.png?text=G`,
        status: 'online' as UserStatus, // Default status for other guests
      };
    }
  }
  
  const senderToDisplay = sender || {
    id: message.senderId,
    name: "Unknown User",
    avatarUrl: `https://placehold.co/100x100.png?text=U`,
    status: 'offline' as UserStatus,
  };

  const senderName = senderToDisplay.name;
  const senderAvatarUrl = senderToDisplay.avatarUrl;
  const avatarFallback = senderName.substring(0, 2).toUpperCase();

  const MessageStatusIndicator = () => {
    if (!isOwnMessage || !message.status) return null;
    const iconSize = "h-4 w-4";
    const commonClass = "text-muted-foreground";
    const readClass = "text-primary";

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
      <div className={cn("flex flex-col", isOwnMessage ? "items-end" : "items-start")}>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "max-w-[70%] rounded-xl px-3.5 py-2.5 shadow-md relative",
                  isOwnMessage
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-card text-card-foreground border rounded-bl-none"
                )}
              >
                {!isOwnMessage && (
                  <p className="text-xs font-medium mb-0.5 text-muted-foreground">{senderName}</p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent side={isOwnMessage ? "left" : "right"} className="text-xs">
              {format(new Date(message.timestamp), "Pp")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className={cn("flex items-center gap-1 mt-1", isOwnMessage ? "mr-1 justify-end" : "ml-1 justify-start")}>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.timestamp), "p")}
          </span>
          {isOwnMessage && <MessageStatusIndicator />}
        </div>
      </div>
       {isOwnMessage && (
        <Avatar className="h-8 w-8 self-start border shrink-0">
          {/* For own messages, the avatar is always the currentUser (effectiveUser) */}
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="user avatar"/>
          <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
