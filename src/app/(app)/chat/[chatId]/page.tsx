
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Message as AppMessage, User as AppUser } from '@/lib/types'; // Renamed to avoid conflict
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessageItem } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
// Smart replies are disabled for now due to data structure changes
// import { generateSmartReplies } from '@/ai/flows/smart-replies';

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string; // e.g., "general"
  const { user: currentUser, loading: authLoading } = useAuth();

  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [chatName, setChatName] = useState(chatId); // Default to chatId, can be fetched
  // const [smartReplies, setSmartReplies] = useState<string[]>([]);
  // const [isLoadingSmartReplies, setIsLoadingSmartReplies] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve

    if (!currentUser) {
      router.replace(`/login?redirect=/chat/${chatId}`);
      return;
    }

    if (!chatId) {
        setIsLoadingMessages(false);
        return;
    };

    // Fetch chat details (like name) if needed - for now, simple name
    // Example: fetch chat name from a 'chats' collection document
    const fetchChatDetails = async () => {
      const chatDocRef = doc(db, 'chats', chatId);
      const chatDocSnap = await getDoc(chatDocRef);
      if (chatDocSnap.exists() && chatDocSnap.data().name) {
        setChatName(chatDocSnap.data().name);
      } else {
        setChatName(chatId.charAt(0).toUpperCase() + chatId.slice(1)); // Default name from ID
      }
    };
    fetchChatDetails();


    const messagesColRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesColRef, orderBy('timestamp', 'asc'));

    setIsLoadingMessages(true);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: AppMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMessages.push({
          id: doc.id,
          chatId: chatId,
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
          timestamp: (data.timestamp as Timestamp)?.toDate().getTime() || Date.now(),
        });
      });
      setMessages(fetchedMessages);
      setIsLoadingMessages(false);
      
      // Scroll to bottom after messages load or update
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
          if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
          }
        }
      }, 100);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setIsLoadingMessages(false);
    });

    return () => unsubscribe(); // Cleanup listener

  }, [chatId, currentUser, authLoading, router]);

  // Smart replies disabled for now
  // useEffect(() => {
  //   if (messages.length > 0 && currentUser) {
  //     // fetchSmartReplies();
  //   }
  // }, [messages, currentUser]);

  const handleSendMessage = async (text: string) => {
    if (!currentUser || !chatId || !text.trim()) return;

    const messagesColRef = collection(db, 'chats', chatId, 'messages');
    try {
      await addDoc(messagesColRef, {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email || "Anonymous",
        text: text.trim(),
        timestamp: serverTimestamp(), // Use Firestore server timestamp
      });
      // Smart replies trigger logic removed
    } catch (error) {
      console.error("Error sending message:", error);
      // Add user feedback for error
    }
  };

  if (authLoading || (isLoadingMessages && !messages.length)) {
    return (
      <div className="flex h-full flex-col p-4">
        <Skeleton className="h-16 w-full mb-4" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-12 w-3/4 self-start rounded-lg" />
          <Skeleton className="h-12 w-3/4 self-end rounded-lg" />
          <Skeleton className="h-12 w-2/3 self-start rounded-lg" />
        </div>
        <Skeleton className="h-20 w-full mt-4" />
      </div>
    );
  }
  
  if (!currentUser && !authLoading) {
     // Should be caught by useEffect redirect, but as a safeguard
    return <div className="flex h-full items-center justify-center">Redirecting to login...</div>;
  }

  if (!chatId) {
    return <div className="flex h-full items-center justify-center">Please select a chat or create a new one.</div>;
  }
  
  // participants and isGroup props are simplified for now for ChatHeader
  // A real app would fetch actual participants for the chat room.
  const mockParticipantsForHeader: AppUser[] = currentUser ? [currentUser] : []; 
  const isGroupChat = chatId.toLowerCase() === 'general'; // Example, adapt as needed

  return (
    <div className="flex h-full max-h-[calc(100vh-theme(spacing.16))] flex-col bg-background">
      <ChatHeader 
        chatId={chatId} 
        name={chatName} 
        avatarUrl={isGroupChat ? `https://placehold.co/100x100.png?text=${chatName?.substring(0,1)}` : currentUser?.photoURL}
        status={isGroupChat ? 'group' : 'online'} // Simplified status
        participants={mockParticipantsForHeader} 
        isGroup={isGroupChat}
      />
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} currentUser={currentUser!} />
          ))}
          {isLoadingMessages && messages.length > 0 && ( // Show loading indicator if appending new messages
             <div className="flex justify-center py-2"><Skeleton className="h-8 w-24 rounded-lg" /></div>
          )}
        </div>
      </ScrollArea>
      <ChatInput 
        onSendMessage={handleSendMessage} 
        smartReplies={[]} // Smart replies disabled
        isLoadingSmartReplies={false}
      />
    </div>
  );
}
