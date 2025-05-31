
"use client";

import { useState, useRef, useEffect, type HTMLAttributes } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PresenceIndicator } from "./presence-indicator";
import type { UserStatus } from "@/lib/types";
import { ArrowLeft, Info, Phone, Video, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  chatId: string;
  name: string;
  avatarUrl?: string;
  status: UserStatus | 'group' | string; 
  participantCount?: number;
  isGroup: boolean;
}

export function ChatHeader({ name, avatarUrl, status, participantCount, isGroup }: ChatHeaderProps) {
  const fallbackName = name ? name.substring(0, 2).toUpperCase() : "??";
  const { toast } = useToast();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleAudioCallClick = () => {
    toast({
      title: "Audio Call",
      description: "Audio call feature is coming soon!",
    });
  };

  const handleVideoCallClick = () => {
    setIsVideoModalOpen(true);
  };

  const handleChatInfoClick = () => {
    toast({
      title: "Chat Info",
      description: "Chat information panel is coming soon!",
    });
  };

  const handleCloseVideoCall = () => {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      setActiveStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsVideoModalOpen(false);
    setHasMediaPermission(null); 
  };

  useEffect(() => {
    if (isVideoModalOpen) {
      const getMedia = async () => {
        setHasMediaPermission(null); // Reset while requesting
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setActiveStream(stream);
          setHasMediaPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing media devices.", err);
          setHasMediaPermission(false);
          toast({
            variant: "destructive",
            title: "Media Access Denied",
            description: "Please enable camera and microphone permissions in your browser settings.",
          });
        }
      };
      getMedia();
    } else {
      // Cleanup stream if modal is closed without explicit button click (e.g. Escape key)
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        setActiveStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    // Cleanup function for when component unmounts or isVideoModalOpen dependency changes to false
    return () => {
      if (activeStream && !isVideoModalOpen) { 
        activeStream.getTracks().forEach(track => track.stop());
        setActiveStream(null); 
         if (videoRef.current) {
           videoRef.current.srcObject = null;
         }
      }
    };
  }, [isVideoModalOpen, toast]); // activeStream removed from deps to prevent potential loops

  return (
    <>
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
          <Button variant="ghost" size="icon" aria-label="Call" onClick={handleAudioCallClick}>
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Video call" onClick={handleVideoCallClick}>
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Chat info" onClick={handleChatInfoClick}>
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Dialog open={isVideoModalOpen} onOpenChange={(isOpen) => {
        setIsVideoModalOpen(isOpen);
        if (!isOpen) { 
          handleCloseVideoCall();
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Video Call Preview</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {hasMediaPermission === null && (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Requesting camera and microphone access...</p>
              </div>
            )}
            {hasMediaPermission === false && (
              <Alert variant="destructive">
                <AlertTitle>Media Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera and microphone access in your browser settings to use this feature.
                </AlertDescription>
              </Alert>
            )}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={cn("w-full aspect-video rounded-md bg-muted", {
                'hidden': hasMediaPermission !== true, // Hide if permission not granted or pending
              })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseVideoCall}>
              <X className="mr-2 h-4 w-4" />
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
