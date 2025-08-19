
"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, SendHorizonal, Smile, Mic, StopCircle, AlertTriangle, File, X } from "lucide-react";
import { SmartReplyButton } from "./smart-reply-button";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from "firebase/storage";
import { Progress } from "../ui/progress";

interface ChatInputProps {
  onSendMessage: (data: { text?: string; attachmentUrl?: string; attachmentType?: string, attachmentName?: string }) => void;
  smartReplies: string[];
  isLoadingSmartReplies: boolean;
}

const emojis = ["😀", "😂", "😍", "🤔", "👍", "🎉", "❤️", "🙏"];

// Helper function to resize images before upload
const compressImage = (file: File, maxWidth: number = 1280): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      resolve(file); // Not an image, return original file
      return;
    }

    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const reader = new FileReader();

    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      }
    };

    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get blob from canvas
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      }, file.type, 0.9); // 0.9 is image quality
    };

    img.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export function ChatInput({ onSendMessage, smartReplies, isLoadingSmartReplies }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState<'idle' | 'pending' | 'granted' | 'denied'>('idle');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [showMicPermissionAlert, setShowMicPermissionAlert] = useState(false);
  const [isEmojiPopoverOpen, setIsEmojiPopoverOpen] = useState(false);

  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({ text: message.trim() });
      setMessage("");
      textareaRef.current?.focus();
    }
  };

  const handleSmartReplyClick = (reply: string) => {
    onSendMessage({ text: reply });
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

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!storage) {
        toast({
            title: "Firebase Storage Error",
            description: "Storage is not configured, cannot upload files.",
            variant: "destructive"
        });
        return;
      }
      
      const toastId = toast({
        title: "Preparing upload...",
        description: `Compressing ${file.name}...`,
      }).id;

      setUploadingFile(file);
      setUploadProgress(0);

      try {
        const fileToUpload = await compressImage(file);
        const storageRef = ref(storage, `chat-attachments/${chatId}/${Date.now()}_${file.name}`);
        const newUploadTask = uploadBytesResumable(storageRef, fileToUpload);
        setUploadTask(newUploadTask);

        newUploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
             toast({
                id: toastId,
                title: "Uploading...",
                description: `Sending ${file.name} - ${Math.round(progress)}%`,
             });
          },
          (error) => {
            console.error("Upload failed:", error);
            toast({
              id: toastId,
              title: "Upload Failed",
              description: "Your file could not be uploaded. Please try again.",
              variant: "destructive"
            });
            setUploadingFile(null);
            setUploadTask(null);
          },
          () => {
            getDownloadURL(newUploadTask.snapshot.ref).then((downloadURL) => {
              onSendMessage({
                attachmentUrl: downloadURL,
                attachmentType: file.type,
                attachmentName: file.name,
                text: message // Send any typed text along with the file
              });
              toast({
                id: toastId,
                title: "File Sent!",
                description: `${file.name} has been sent.`,
              });
              setMessage(""); // Clear message input after sending attachment
              setUploadingFile(null);
              setUploadTask(null);
            });
          }
        );
      } catch (error) {
        console.error("Image compression or upload failed", error);
        toast({
            id: toastId,
            title: "Upload Failed",
            description: "There was an error processing your file.",
            variant: "destructive"
        });
        setUploadingFile(null);
        setUploadTask(null);
      }


      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    }
  };
  
  const handleCancelUpload = () => {
    if (uploadTask) {
        uploadTask.cancel();
        toast({
            title: "Upload Cancelled",
            description: `Upload of ${uploadingFile?.name} was cancelled.`,
            variant: "destructive"
        });
    }
    setUploadingFile(null);
    setUploadProgress(0);
    setUploadTask(null);
  };


  const handleEmojiSelect = (emoji: string) => {
    setMessage(prevMessage => prevMessage + emoji);
    setIsEmojiPopoverOpen(false);
    textareaRef.current?.focus();
  };

  const handleVoiceNoteClick = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
      onSendMessage({ text: "🎤 Voice Note sent (mocked)" });
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

  const [chatId, setChatId] = useState('');
    useEffect(() => {
        if (window.location.pathname.includes('/chat/')) {
            setChatId(window.location.pathname.split('/chat/')[1]);
        }
    }, []);

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
      {uploadingFile && (
        <div className="p-2 rounded-lg border bg-muted/50">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <File className="h-5 w-5 shrink-0" />
                    <div className="text-sm truncate">
                        <p className="font-medium truncate">{uploadingFile.name}</p>
                        <p className="text-xs text-muted-foreground">{uploadingFile.type.startsWith('image/') ? "Compressing & uploading..." : "Uploading..."}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={handleCancelUpload}>
                    <X className="h-4 w-4"/>
                </Button>
            </div>
            <Progress value={uploadProgress} className="h-1 mt-1" />
        </div>
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
        <Button variant="ghost" size="icon" className="shrink-0" onClick={handleAttachmentClick} disabled={isRecording || !!uploadingFile}>
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          disabled={isRecording || !!uploadingFile}
        />
        
        <Popover open={isEmojiPopoverOpen} onOpenChange={setIsEmojiPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0" disabled={isRecording || !!uploadingFile}>
              <Smile className="h-5 w-5" />
              <span className="sr-only">Add emoji</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-4 gap-1">
              {emojis.map(emoji => (
                <Button 
                  key={emoji} 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEmojiSelect(emoji)}
                  className="text-xl"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex-1 flex items-end relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Recording voice note..." : "Type a message..."}
            className={cn(
              "flex-1 resize-none rounded-full border-input bg-background px-4 py-2.5 text-sm focus-visible:ring-1 min-h-[44px] max-h-[120px]",
              (isRecording || !!uploadingFile) && "pr-12 bg-muted/50 cursor-not-allowed"
            )}
            rows={1}
            disabled={isRecording || !!uploadingFile}
          />
          {isRecording && micPermission === 'granted' && (
             <span className="absolute right-3 bottom-2.5 text-xs text-primary animate-pulse">REC</span>
          )}
           {isRecording && micPermission === 'pending' && (
             <span className="absolute right-3 bottom-2.5 text-xs text-muted-foreground animate-pulse">...</span>
          )}
        </div>

        <Button 
          onClick={message.trim() && !isRecording ? handleSend : handleVoiceNoteClick} 
          size="icon" 
          className={cn(
            "shrink-0 rounded-full",
            isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
          )}
          aria-label={isRecording ? "Stop recording" : (message.trim() ? "Send message" : "Record voice note")}
          disabled={!!uploadingFile}
        >
          {isRecording ? (
            <StopCircle className="h-5 w-5" />
          ) : message.trim() ? (
            <SendHorizonal className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
