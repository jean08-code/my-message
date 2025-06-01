
"use client";

import type { Message, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// Message status icons (Check, CheckCheck) are removed as status feature is simplified

interface ChatMessageItemProps {
  message: Message;
  currentUser: User; 
}

export function ChatMessageItem({ message, currentUser }: ChatMessageItemProps) {
  const isOwnMessage = message.senderId === currentUser.uid;

  const senderName = isOwnMessage ? (currentUser.displayName || "Me") : (message.senderName || "User");
  
  // For avatar, if it's own message, use currentUser's photoURL.
  // If it's another user's message, Firestore message should ideally include senderPhotoURL.
  // For now, if senderPhotoURL is not on the message, use a placeholder.
  const senderAvatarUrl = isOwnMessage 
    ? (currentUser.photoURL || `https://placehold.co/100x100.png?text=${senderName.substring(0,1)}`)
    : (message.senderPhotoURL || `https://placehold.co/100x100.png?text=${senderName.substring(0,1)}`); // Assuming senderPhotoURL might be on message
  
  const avatarFallback = senderName ? senderName.substring(0, 2).toUpperCase() : "U";

  // MessageStatusIndicator removed as message status feature is simplified/removed for this Firebase pass

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
              {message.timestamp ? format(new Date(message.timestamp), "Pp") : "Sending..."}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className={cn("flex items-center gap-1 mt-1", isOwnMessage ? "mr-1 justify-end" : "ml-1 justify-start")}>
          <span className="text-xs text-muted-foreground">
            {message.timestamp ? format(new Date(message.timestamp), "p") : ""}
          </span>
          {/* MessageStatusIndicator removed */}
        </div>
      </div>
       {isOwnMessage && (
        <Avatar className="h-8 w-8 self-start border shrink-0">
          <AvatarImage src={senderAvatarUrl} alt={currentUser.displayName || "Me"} data-ai-hint="user avatar"/>
          <AvatarFallback>{currentUser.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : "ME"}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
