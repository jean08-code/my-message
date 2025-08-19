
"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, PlusCircle, AlertTriangle, X } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import { db, storage, isFirebaseConfigured } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import type { Story } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface GroupedStory {
  userId: string;
  userDisplayName: string | null;
  userPhotoURL: string | null;
  stories: Story[];
}

export default function StoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<GroupedStory[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<GroupedStory | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoadingStories(false);
      return;
    }

    const now = new Date();
    const storiesColRef = collection(db, 'stories');
    // Query for stories that have not expired yet
    const q = query(storiesColRef, where('expiresAt', '>', now.getTime()), orderBy('expiresAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedStories: Story[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        fetchedStories.push({
          id: doc.id,
          ...data
        } as Story);
      });

      // Group stories by user
      const grouped = fetchedStories.reduce((acc, story) => {
        let group = acc.find(g => g.userId === story.userId);
        if (!group) {
          group = {
            userId: story.userId,
            userDisplayName: story.userDisplayName,
            userPhotoURL: story.userPhotoURL,
            stories: []
          };
          acc.push(group);
        }
        group.stories.push(story);
        return acc;
      }, [] as GroupedStory[]);
      
      setStories(grouped);
      setIsLoadingStories(false);
    }, (error) => {
      console.error("Error fetching stories: ", error);
      setIsLoadingStories(false);
      toast({ title: "Error", description: "Could not fetch stories.", variant: "destructive" });
    });

    return () => unsubscribe();
  }, [toast]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File", description: "Only image files can be uploaded as stories.", variant: "destructive" });
        return;
    }

    setUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `stories/${user.uid}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({ title: "Upload Failed", description: "Your story could not be uploaded.", variant: "destructive" });
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await addDoc(collection(db, 'stories'), {
          userId: user.uid,
          userDisplayName: user.displayName,
          userPhotoURL: user.photoURL,
          mediaUrl: downloadURL,
          mediaType: file.type,
          timestamp: serverTimestamp(),
          expiresAt: twentyFourHoursFromNow.getTime()
        });

        toast({ title: "Story Uploaded!", description: "Your story is now live for 24 hours." });
        setUploading(false);
      }
    );
  };
  
  const openStoryViewer = (storyGroup: GroupedStory) => {
    setSelectedStoryGroup(storyGroup);
    setCurrentStoryIndex(0);
  }
  
  const closeStoryViewer = () => {
    setSelectedStoryGroup(null);
  }

  const goToNextStory = () => {
    if (selectedStoryGroup) {
      setCurrentStoryIndex(prev => (prev + 1) % selectedStoryGroup.stories.length);
    }
  }

  const goToPreviousStory = () => {
     if (selectedStoryGroup) {
      setCurrentStoryIndex(prev => (prev - 1 + selectedStoryGroup.stories.length) % selectedStoryGroup.stories.length);
    }
  }

  const myStory = stories.find(s => s.userId === user?.uid);
  const otherStories = stories.filter(s => s.userId !== user?.uid);


  return (
    <>
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Stories</h1>
        <Button asChild>
           <label htmlFor="story-upload" className="cursor-pointer">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Story
           </label>
        </Button>
         <Input type="file" className="hidden" id="story-upload" onChange={handleFileChange} accept="image/*" disabled={uploading || authLoading || !user} />
      </div>

       {uploading && (
        <Card className="mb-8 border-primary/50">
          <CardHeader>
            <CardTitle>Uploading Your Story...</CardTitle>
            <CardDescription>Please wait while we process your image.</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={uploadProgress} className="w-full" />
          </CardContent>
        </Card>
      )}

      {myStory && (
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Story</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                 <div onClick={() => openStoryViewer(myStory)} className="flex flex-col items-center gap-2 cursor-pointer">
                    <div className="rounded-full p-1 bg-gradient-to-tr from-yellow-400 to-pink-500">
                        <Avatar className="w-16 h-16 border-2 border-background">
                            <AvatarImage src={myStory.userPhotoURL ?? undefined} alt={myStory.userDisplayName || 'User'} data-ai-hint="user avatar story"/>
                            <AvatarFallback>{myStory.userDisplayName?.substring(0,1) || 'U'}</AvatarFallback>
                        </Avatar>
                    </div>
                    <p className="text-xs font-medium truncate">Your Story</p>
                </div>
            </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Stories</h2>
        {isLoadingStories ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="w-16 h-20 rounded-lg"/>)}
            </div>
        ) : otherStories.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {otherStories.map((group) => (
              <div key={group.userId} onClick={() => openStoryViewer(group)} className="flex flex-col items-center gap-2 cursor-pointer">
                <div className="rounded-full p-1 bg-gradient-to-tr from-yellow-400 to-pink-500">
                    <Avatar className="w-16 h-16 border-2 border-background">
                        <AvatarImage src={group.userPhotoURL ?? undefined} alt={group.userDisplayName || 'User'} data-ai-hint="user avatar story"/>
                        <AvatarFallback>{group.userDisplayName?.substring(0,1) || 'U'}</AvatarFallback>
                    </Avatar>
                </div>
                <p className="text-xs font-medium truncate">{group.userDisplayName}</p>
              </div>
            ))}
          </div>
        ) : (
            <Card className="flex flex-col items-center justify-center p-8 border-dashed">
                <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No stories from other users right now.</p>
                <p className="text-sm text-muted-foreground">Be the first to share something!</p>
            </Card>
        )}
      </div>
    </div>
    
    <Dialog open={!!selectedStoryGroup} onOpenChange={(isOpen) => !isOpen && closeStoryViewer()}>
        <DialogContent className="p-0 max-w-md h-[80vh] bg-black border-0 flex flex-col items-center justify-center">
             {selectedStoryGroup && (
                <>
                <DialogHeader className="absolute top-0 left-0 w-full p-4 z-10 bg-gradient-to-b from-black/60 to-transparent">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border">
                             <AvatarImage src={selectedStoryGroup.userPhotoURL ?? undefined} alt={selectedStoryGroup.userDisplayName || 'User'}/>
                             <AvatarFallback>{selectedStoryGroup.userDisplayName?.substring(0,1) || 'U'}</AvatarFallback>
                        </Avatar>
                        <DialogTitle className="text-white text-sm">{selectedStoryGroup.userDisplayName}</DialogTitle>
                    </div>
                </DialogHeader>
                 <div className="absolute top-2 w-[calc(100%-1rem)] px-2 flex gap-1 z-10">
                    {selectedStoryGroup.stories.map((_, index) => (
                        <div key={index} className="h-1 flex-1 rounded-full bg-white/30">
                            <div
                                className="h-1 rounded-full bg-white"
                                style={{ width: `${index === currentStoryIndex ? '100' : '0'}%` }}
                            />
                        </div>
                    ))}
                </div>
                <div className="relative w-full h-full">
                  <Image 
                      src={selectedStoryGroup.stories[currentStoryIndex].mediaUrl}
                      alt="Story"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-lg"
                  />
                </div>
                 <div className="absolute inset-0 flex justify-between items-center">
                    <button onClick={goToPreviousStory} className="h-full w-1/3" aria-label="Previous Story" />
                    <button onClick={goToNextStory} className="h-full w-1/3" aria-label="Next Story" />
                </div>
                <DialogClose className="absolute top-4 right-4 z-20">
                     <X className="w-6 h-6 text-white"/>
                </DialogClose>
                </>
             )}
        </DialogContent>
    </Dialog>
    </>
  );
}
