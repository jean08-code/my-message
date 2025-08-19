
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, PlusCircle } from "lucide-react";

export default function StoryPage() {
  // Mock data for stories
  const stories = [
    { id: 1, user: "Alice", avatar: "https://placehold.co/100x100.png?text=A", seen: false },
    { id: 2, user: "Bob", avatar: "https://placehold.co/100x100.png?text=B", seen: false },
    { id: 3, user: "Charlie", avatar: "https://placehold.co/100x100.png?text=C", seen: true },
    { id: 4, user: "Diana", avatar: "https://placehold.co/100x100.png?text=D", seen: true },
  ];

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Stories</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Story
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Story</CardTitle>
          <CardDescription>Share a photo or video that will disappear in 24 hours.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-lg">
            <Camera className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-semibold">Add to your story</p>
              <p className="text-sm text-muted-foreground">Select a file to upload.</p>
            </div>
            <Input type="file" className="hidden" id="story-upload" />
            <Button asChild>
              <label htmlFor="story-upload">Choose File</label>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Stories</h2>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer">
              <div className={`rounded-full p-1 ${story.seen ? 'bg-gray-300' : 'bg-gradient-to-tr from-yellow-400 to-pink-500'}`}>
                <img
                  src={story.avatar}
                  alt={story.user}
                  className="w-16 h-16 rounded-full border-2 border-background"
                  data-ai-hint="user avatar story"
                />
              </div>
              <p className="text-xs font-medium truncate">{story.user}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
