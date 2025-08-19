
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
import { db, isFirebaseConfigured } from '@/lib/firebase';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
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
      if (isFirebaseConfigured) {
        router.replace(`/login?redirect=/chat/${chatId}`);
      }
      // In mock mode, allow guests
    }

    if (!chatId) {
        setIsLoadingMessages(false);
        return;
    };
    
    if (!isFirebaseConfigured) {
        setChatName(chatId.charAt(0).toUpperCase() + chatId.slice(1));
        setIsLoadingMessages(false);
        // In mock mode, we don't fetch messages, they are handled in-memory
        return;
    }


    // Fetch chat details (like name) if needed - for now, simple name
    const fetchChatDetails = async () => {
      // For 1-on-1 chats, the name should be the other user's name
      if (currentUser && chatId.includes('_')) {
        const otherUserId = chatId.split('_').filter(id => id !== currentUser.uid)[0];
        if (otherUserId) {
          const userDocRef = doc(db, 'users', otherUserId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setChatName(userDocSnap.data().displayName || 'Chat User');
          }
          return;
        }
      }
      
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
          attachmentUrl: data.attachmentUrl,
          attachmentType: data.attachmentType,
          attachmentName: data.attachmentName
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

  const handleSendMessage = async (data: { text?: string; attachmentUrl?: string; attachmentType?: string, attachmentName?: string }) => {
    const { text, attachmentUrl, attachmentType, attachmentName } = data;
    if (!currentUser || !chatId || (!text?.trim() && !attachmentUrl)) return;

    if (!isFirebaseConfigured) {
        // Handle mock message sending
        const newMessage: AppMessage = {
            id: `mock_${Date.now()}`,
            chatId: chatId,
            senderId: currentUser.uid,
            senderName: currentUser.displayName,
            text: text?.trim() || '',
            timestamp: Date.now(),
            attachmentUrl: attachmentUrl,
            attachmentType: attachmentType,
            attachmentName: attachmentName,
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        return;
    }

    const messagesColRef = collection(db, 'chats', chatId, 'messages');
    try {
      await addDoc(messagesColRef, {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email || "Anonymous",
        senderPhotoURL: currentUser.photoURL,
        text: text?.trim() || '',
        timestamp: serverTimestamp(), // Use Firestore server timestamp
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentType || null,
        attachmentName: attachmentName || null,
      });
      // Smart replies trigger logic removed
    } catch (error) {
      console.error("Error sending message:", error);
      // Add user feedback for error
    }
  };

  if (authLoading || (isLoadingMessages && !messages.length && isFirebaseConfigured)) {
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
  
  if (!currentUser && !authLoading && isFirebaseConfigured) {
     // Should be caught by useEffect redirect, but as a safeguard
    return <div className="flex h-full items-center justify-center">Redirecting to login...</div>;
  }

  if (!chatId) {
    return <div className="flex h-full items-center justify-center">Please select a chat or create a new one.</div>;
  }
  
  const mockParticipantsForHeader: AppUser[] = currentUser ? [currentUser] : []; 
  const isGroupChat = !chatId.includes('_');

  return (
    <div className="flex h-full max-h-[calc(100vh-theme(spacing.16))] flex-col bg-background">
      {!isFirebaseConfigured && (
        <Alert className="m-4 rounded-lg border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="font-semibold">Offline / Mock Mode</AlertTitle>
            <AlertDescription>
              The app is running in a mock mode. To enable real-time chat with a persistent backend, please configure your Firebase credentials in 
              <code className="mx-1 rounded bg-amber-200/50 px-1 py-0.5 text-xs dark:bg-amber-800/50">src/lib/firebase.ts</code>.
            </AlertDescription>
        </Alert>
      )}
      <ChatHeader 
        chatId={chatId} 
        name={chatName} 
        avatarUrl={isGroupChat ? `https://placehold.co/100x100.png?text=${chatName?.substring(0,1)}` : currentUser?.photoURL}
        status={isGroupChat ? 'group' : 'online'}
        participants={mockParticipantsForHeader} 
        isGroup={isGroupChat}
      />
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} currentUser={currentUser!} />
          ))}
          {isLoadingMessages && messages.length > 0 && (
             <div className="flex justify-center py-2"><Skeleton className="h-8 w-24 rounded-lg" /></div>
          )}
        </div>
      </ScrollArea>
      <ChatInput 
        onSendMessage={handleSendMessage} 
        smartReplies={[]}
        isLoadingSmartReplies={false}
      />
    </div>
  );
}
