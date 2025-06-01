
"use client";

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// PresenceIndicator is removed as user status feature is simplified/removed
// import { PresenceIndicator } from "./presence-indicator";
import type { User } from "@/lib/types"; // Using AppUser type
import { ArrowLeft, Info, Phone, Video, X, Mic, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/contexts/auth-context'; 

interface ChatHeaderProps {
  chatId: string;
  name: string;
  avatarUrl?: string | null;
  status: 'group' | 'online' | 'offline' | string; // Status simplified
  participants: User[]; // Expects AppUser[]
  isGroup: boolean;
}

export function ChatHeader({ name, avatarUrl, status, participants, isGroup }: ChatHeaderProps) {
  const fallbackName = name ? name.substring(0, 2).toUpperCase() : "??";
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoPermissionStatus, setVideoPermissionStatus] = useState<'pending' | 'granted' | 'denied' | 'idle'>('idle');
  const [activeVideoStream, setActiveVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [audioPermissionStatus, setAudioPermissionStatus] = useState<'pending' | 'granted' | 'denied' | 'idle'>('idle');
  const [activeAudioStream, setActiveAudioStream] = useState<MediaStream | null>(null);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
  const participantCount = participants.length;

  // Video Call Logic
  const handleVideoCallClick = () => setIsVideoModalOpen(true);
  const handleCloseVideoCall = () => {
    if (activeVideoStream) activeVideoStream.getTracks().forEach(track => track.stop());
    setActiveVideoStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsVideoModalOpen(false);
    setVideoPermissionStatus('idle'); 
  };

  useEffect(() => {
    if (isVideoModalOpen) {
      const getMedia = async () => {
        setVideoPermissionStatus('pending');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setActiveVideoStream(stream);
          setVideoPermissionStatus('granted');
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
          setVideoPermissionStatus('denied');
          toast({ variant: "destructive", title: "Media Access Denied", description: "Enable camera/mic permissions." });
        }
      };
      getMedia();
    }
    return () => {
      if (activeVideoStream) activeVideoStream.getTracks().forEach(track => track.stop());
    };
  }, [isVideoModalOpen, toast, activeVideoStream]);


  // Audio Call Logic
  const handleAudioCallClick = () => setIsAudioModalOpen(true);
  const handleCloseAudioCall = () => {
    if (activeAudioStream) activeAudioStream.getTracks().forEach(track => track.stop());
    setActiveAudioStream(null);
    setIsAudioModalOpen(false);
    setAudioPermissionStatus('idle');
  };

  useEffect(() => {
    if (isAudioModalOpen) {
      const getAudio = async () => {
        setAudioPermissionStatus('pending');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setActiveAudioStream(stream);
          setAudioPermissionStatus('granted');
        } catch (err) {
          setAudioPermissionStatus('denied');
           toast({ variant: "destructive", title: "Mic Access Denied", description: "Enable mic permissions." });
        }
      };
      getAudio();
    }
     return () => {
      if (activeAudioStream) activeAudioStream.getTracks().forEach(track => track.stop());
    };
  }, [isAudioModalOpen, toast, activeAudioStream]);

  // Chat Info Logic
  const handleChatInfoClick = () => setIsInfoModalOpen(true);
  
  const actualParticipants = isGroup ? participants : participants.filter(p => p.uid !== currentUser?.uid);
  const displayAvatarUrl = avatarUrl || (isGroup ? `https://placehold.co/100x100.png?text=${fallbackName}` : `https://placehold.co/100x100.png?text=${fallbackName}`);

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
              <AvatarImage src={displayAvatarUrl} alt={name} data-ai-hint="user avatar group"/>
              <AvatarFallback>{fallbackName}</AvatarFallback>
            </Avatar>
            {/* PresenceIndicator removed for simplicity */}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{name}</h2>
            <p className="text-xs text-muted-foreground">
              {isGroup ? `${participantCount} members` : status /* Simplified status display */}
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

      {/* Video Call Dialog */}
      <Dialog open={isVideoModalOpen} onOpenChange={(isOpen) => { if (!isOpen) handleCloseVideoCall(); else setIsVideoModalOpen(true); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Video Call Preview</DialogTitle>
            <DialogDescription>Camera and microphone access for call.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {videoPermissionStatus === 'pending' && <p className="text-muted-foreground text-center">Requesting media access...</p>}
            {videoPermissionStatus === 'denied' && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Media Access Denied</AlertTitle></Alert>}
            <video ref={videoRef} autoPlay muted playsInline className={cn("w-full aspect-video rounded-md bg-muted", {'hidden': videoPermissionStatus !== 'granted'})} />
            {videoPermissionStatus === 'granted' && <p className="text-sm text-center text-green-600">Video preview active. Call (mocked).</p>}
          </div>
          <DialogFooter><Button variant="outline" onClick={handleCloseVideoCall}><X className="mr-2 h-4 w-4" />End Call</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audio Call Dialog */}
      <Dialog open={isAudioModalOpen} onOpenChange={(isOpen) => { if (!isOpen) handleCloseAudioCall(); else setIsAudioModalOpen(true);}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Audio Call</DialogTitle><DialogDescription>Attempting audio call.</DialogDescription></DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center space-y-3">
            {audioPermissionStatus === 'pending' && <><Mic className="h-10 w-10 animate-pulse text-primary" /><p>Requesting mic access...</p></>}
            {audioPermissionStatus === 'granted' && <><Mic className="h-10 w-10 text-green-500" /><p>Mic connected. Audio call (mock).</p></>}
            {audioPermissionStatus === 'denied' && <Alert variant="destructive" className="w-full"><AlertTriangle className="h-4 w-4" /><AlertTitle>Mic Access Denied</AlertTitle></Alert>}
          </div>
          <DialogFooter><Button variant="outline" onClick={handleCloseAudioCall}><X className="mr-2 h-4 w-4" />End Call</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Info Dialog */}
      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary" />Chat Information</DialogTitle>
            <DialogDescription>Details about {isGroup ? "this group" : `chat with ${name}`}.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div><h3 className="text-sm font-medium text-muted-foreground mb-1">{isGroup ? "Group Name" : "Chatting With"}</h3><p className="text-lg font-semibold">{name}</p></div>
             {isGroup && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2"><Users className="inline h-4 w-4 mr-1.5" />Participants ({participantCount})</h3>
                <ScrollArea className="h-[150px] rounded-md border p-2">
                  <ul className="space-y-2">
                    {participants.map(p => (
                      <li key={p.uid} className="flex items-center gap-2 text-sm">
                        <Avatar className="h-7 w-7 border text-xs">
                          <AvatarImage src={p.photoURL || `https://placehold.co/100x100.png?text=${p.displayName?.substring(0,1)}`} alt={p.displayName || "User"} data-ai-hint="user avatar small"/>
                          <AvatarFallback>{p.displayName ? p.displayName.substring(0,1) : "U"}</AvatarFallback>
                        </Avatar>
                        <span>{p.displayName || "User"} {p.uid === currentUser?.uid ? "(You)" : ""}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}
            {/* Simplified: Removed status display for non-group chats as user status is complex now */}
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
