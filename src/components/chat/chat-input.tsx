
"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, SendHorizonal, Smile, Mic, StopCircle, AlertTriangle } from "lucide-react";
import { SmartReplyButton } from "./smart-reply-button";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  smartReplies: string[];
  isLoadingSmartReplies: boolean;
}

export function ChatInput({ onSendMessage, smartReplies, isLoadingSmartReplies }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState<'idle' | 'pending' | 'granted' | 'denied'>('idle');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [showMicPermissionAlert, setShowMicPermissionAlert] = useState(false);

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
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileSizeKB = (file.size / 1024).toFixed(1);
      onSendMessage(`📎 Attached: ${file.name} (${fileSizeKB} KB)`);
      toast({
        title: "File Attached",
        description: `${file.name} (${fileSizeKB} KB) was sent as a message.`,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleEmojiClick = () => {
    toast({
      title: "Emoji Picker",
      description: "Emoji picker is coming soon!",
    });
  };

  const handleVoiceNoteClick = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
      onSendMessage("🎤 Voice Note sent (mocked)");
      toast({
        title: "Voice Note",
        description: "Voice note sent (mocked recording).",
      });
      setMicPermission('idle');
    } else {
      // Start recording
      setShowMicPermissionAlert(false);
      setMicPermission('pending');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
        setMicPermission('granted');
        setIsRecording(true);
        toast({
          title: "Recording Started",
          description: "Microphone is active. Click stop to send.",
        });
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setMicPermission('denied');
        setShowMicPermissionAlert(true);
        // Toast is also shown in the Alert now.
        // toast({
        //   variant: 'destructive',
        //   title: 'Microphone Access Denied',
        //   description: 'Please enable microphone permissions in your browser settings.',
        // });
      }
    }
  };

  // Cleanup audio stream on component unmount
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioStream]);

  return (
    <div className="border-t bg-card p-3 md:p-4 space-y-2">
      {showMicPermissionAlert && micPermission === 'denied' && (
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Microphone Access Denied</AlertTitle>
          <AlertDescription>
            To send voice notes, please enable microphone permissions in your browser settings and try again.
          </AlertDescription>
        </Alert>
      )}
      { (isLoadingSmartReplies || smartReplies.length > 0) && (
        <div className="flex gap-2 overflow-x-auto pb-2">
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
      <div className="flex items-end gap-2">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={handleAttachmentClick} disabled={isRecording}>
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          disabled={isRecording}
        />
        <Button variant="ghost" size="icon" className="shrink-0" onClick={handleEmojiClick} disabled={isRecording}>
          <Smile className="h-5 w-5" />
          <span className="sr-only">Add emoji</span>
        </Button>
        
        <div className="flex-1 flex items-end relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Recording voice note..." : "Type a message..."}
            className={cn(
              "flex-1 resize-none rounded-full border-input bg-background px-4 py-2.5 text-sm focus-visible:ring-1 min-h-[44px] max-h-[120px]",
              isRecording && "pr-12 bg-muted/50 cursor-not-allowed"
            )}
            rows={1}
            disabled={isRecording}
          />
          {isRecording && (
             <span className="absolute right-3 bottom-2.5 text-xs text-primary animate-pulse">REC</span>
          )}
        </div>

        <Button 
          onClick={isRecording ? handleVoiceNoteClick : handleSend} 
          size="icon" 
          className={cn(
            "shrink-0 rounded-full bg-accent hover:bg-accent/90",
            isRecording && "bg-red-500 hover:bg-red-600"
          )}
          aria-label={isRecording ? "Stop recording" : (message.trim() ? "Send message" : "Record voice note")}
        >
          {isRecording ? (
            <StopCircle className="h-5 w-5" />
          ) : message.trim() ? (
            <SendHorizonal className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
        
        {/* Fallback voice note button if primary button is for sending text */}
        {/* This logic is now integrated into the main send button */}
        {/* {!message.trim() && !isRecording && (
          <Button onClick={handleVoiceNoteClick} size="icon" className="shrink-0 rounded-full bg-primary hover:bg-primary/90" aria-label="Record voice note">
            <Mic className="h-5 w-5" />
          </Button>
        )}
        {isRecording && (
           <Button onClick={handleVoiceNoteClick} size="icon" className="shrink-0 rounded-full bg-red-500 hover:bg-red-600" aria-label="Stop recording">
            <StopCircle className="h-5 w-5" />
          </Button>
        )} */}

      </div>
    </div>
  );
}
