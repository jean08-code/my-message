import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import Image from "next/image";

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-4 text-center">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircle size={48} strokeWidth={1.5}/>
          </div>
          <CardTitle className="text-2xl font-semibold">Welcome to RippleChat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select a chat from the list on the left to start messaging,
            or create a new conversation.
          </p>
          <div className="mt-8">
            <Image 
              src="https://placehold.co/300x200.png" 
              alt="Chat illustration" 
              width={300} 
              height={200} 
              className="mx-auto rounded-md opacity-75"
              data-ai-hint="communication chat"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
