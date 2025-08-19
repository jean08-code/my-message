
"use client";

import type { Message, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from 'next/image';
import { File, Download } from "lucide-react";
import { Button } from "../ui/button";

interface ChatMessageItemProps {
  message: Message;
  currentUser: User; 
}

const isImage = (type?: string) => type?.startsWith('image/');

const AttachmentPreview = ({ message }: { message: Message }) => {
    if (!message.attachmentUrl) return null;

    if (isImage(message.attachmentType)) {
        return (
            <div className="relative mt-2 h-48 w-48 cursor-pointer overflow-hidden rounded-lg border">
                <Image
                    src={message.attachmentUrl}
                    alt={message.attachmentName || "Uploaded image"}
                    layout="fill"
                    objectFit="cover"
                    onClick={() => window.open(message.attachmentUrl, '_blank')}
                />
            </div>
        );
    }

    // Fallback for other file types
    return (
        <div className="mt-2 flex items-center rounded-lg border bg-muted/50 p-2">
            <File className="h-7 w-7 text-muted-foreground mr-2 shrink-0" />
            <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{message.attachmentName || "Attachment"}</p>
                <p className="text-xs text-muted-foreground">Click to download</p>
            </div>
             <a href={message.attachmentUrl} target="_blank" rel="noopener noreferrer" download={message.attachmentName}>
                <Button variant="ghost" size="icon">
                    <Download className="h-5 w-5" />
                </Button>
            </a>
        </div>
    )
}

export function ChatMessageItem({ message, currentUser }: ChatMessageItemProps) {
  const isOwnMessage = message.senderId === currentUser.uid;

  const senderName = isOwnMessage ? (currentUser.displayName || "Me") : (message.senderName || "User");
  
  const senderAvatarUrl = isOwnMessage 
    ? (currentUser.photoURL || `https://placehold.co/100x100.png?text=${senderName.substring(0,1)}`)
    : (message.senderPhotoURL || `https://placehold.co/100x100.png?text=${senderName.substring(0,1)}`); // Assuming senderPhotoURL might be on message
  
  const avatarFallback = senderName ? senderName.substring(0, 2).toUpperCase() : "U";

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
                {message.text && <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>}
                {message.attachmentUrl && <AttachmentPreview message={message} />}
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
