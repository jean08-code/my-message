
"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, SendHorizonal, Smile } from "lucide-react";
import { SmartReplyButton } from "./smart-reply-button";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast"; // Added for toast messages

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  smartReplies: string[];
  isLoadingSmartReplies: boolean;
}

export function ChatInput({ onSendMessage, smartReplies, isLoadingSmartReplies }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input
  const { toast } = useToast(); // Hook for toast messages

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      textareaRef.current?.focus();
    }
  };

  const handleSmartReplyClick = (reply: string) => {
    onSendMessage(reply);
  };
  
  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click(); // Trigger hidden file input
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "File Selected",
        description: `"${file.name}" ready to be attached (feature in progress).`,
      });
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // In a real app, you'd handle the file upload here
      // For now, we just show a toast. You might want to send a message like:
      // onSendMessage(`Attached: ${file.name}`);
    }
  };

  const handleEmojiClick = () => {
    toast({
      title: "Emoji Picker",
      description: "Emoji picker is coming soon!",
    });
  };

  return (
    <div className="border-t bg-card p-3 md:p-4">
      { (isLoadingSmartReplies || smartReplies.length > 0) && (
        <div className="mb-2 flex gap-2 overflow-x-auto pb-2">
          {isLoadingSmartReplies ? (
            <>
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </>
          ) : (
            smartReplies.map((reply, index) => (
              <SmartReplyButton key={index} text={reply} onClick={() => handleSmartReplyClick(reply)} />
            ))
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={handleAttachmentClick}>
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <Button variant="ghost" size="icon" className="shrink-0" onClick={handleEmojiClick}>
          <Smile className="h-5 w-5" />
          <span className="sr-only">Add emoji</span>
        </Button>
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded-full border-input bg-background px-4 py-2.5 text-sm focus-visible:ring-1 min-h-[44px] max-h-[120px]"
          rows={1}
        />
        <Button onClick={handleSend} size="icon" className="shrink-0 rounded-full bg-accent hover:bg-accent/90" aria-label="Send message">
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
