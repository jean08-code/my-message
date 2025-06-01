
"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { mockChats, mockUsers } from '@/lib/mock-data';
import type { Chat, Message, User, MessageStatus } from '@/lib/types';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessageItem } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/auth-context';
import { generateSmartReplies } from '@/ai/flows/smart-replies';
import { Skeleton } from '@/components/ui/skeleton';

// Function to generate a unique guest ID
const generateGuestId = () => `guest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function ChatConversationPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { user: authenticatedUser } = useAuth();

  // effectiveUser will be the authenticated user or a guest user
  const effectiveUser = useMemo<User>(() => {
    if (authenticatedUser) {
      return authenticatedUser;
    }
    // Create a persistent guest user object stored in localStorage or generate new
    let guestId = typeof window !== 'undefined' ? localStorage.getItem('rippleChatGuestId') : null;
    if (!guestId) {
      guestId = generateGuestId();
      if (typeof window !== 'undefined') {
        localStorage.setItem('rippleChatGuestId', guestId);
      }
    }
    return {
      id: guestId,
      name: 'Guest',
      avatarUrl: `https://placehold.co/100x100.png?text=G`,
      status: 'online',
    };
  }, [authenticatedUser]);

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isLoadingSmartReplies, setIsLoadingSmartReplies] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isGuest = !authenticatedUser;

  useEffect(() => {
    if (chatId) {
      setIsLoading(true);
      const foundChat = mockChats.find(c => c.id === chatId);
      if (foundChat) {
        const enrichedMessages = foundChat.messages.map(msg => ({
          ...msg,
          isOwn: msg.senderId === effectiveUser.id, // Use effectiveUser for isOwn
          status: msg.status || (msg.senderId === effectiveUser.id ? 'read' : undefined) 
        }));
        setChat(foundChat);
        setMessages(enrichedMessages);
      } else {
        setChat(null);
        setMessages([]);
      }
      setIsLoading(false);
    }
  }, [chatId, effectiveUser]); // Depend on effectiveUser

  useEffect(() => {
    if (messages.length > 0) {
      if (!isGuest) { // Only fetch smart replies for logged-in users
        fetchSmartReplies();
      } else {
        setSmartReplies([]); // Clear smart replies for guests
      }
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }
  }, [messages, isGuest]);

  const fetchSmartReplies = async () => {
    if (messages.length === 0 || isGuest) return; // Do not fetch for guests
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.senderId === effectiveUser.id) {
      setSmartReplies([]);
      return;
    }

    setIsLoadingSmartReplies(true);
    try {
      const lastMessagesInput = messages.slice(-5).map(msg => {
        let sender = mockUsers.find(u => u.id === msg.senderId);
        if (!sender && msg.senderId.startsWith('guest-')) {
          sender = {id: msg.senderId, name: 'Guest', status: 'online'};
        }
        return {
          sender: sender ? sender.name : 'Unknown',
          text: msg.text
        };
      });
      const result = await generateSmartReplies({ messages: lastMessagesInput });
      setSmartReplies(result.suggestions);
    } catch (error) {
      console.error("Failed to generate smart replies:", error);
      setSmartReplies([]);
    } finally {
      setIsLoadingSmartReplies(false);
    }
  };

  const updateMessageStatusInMockData = (messageId: string, newStatus: MessageStatus) => {
    const chatIndex = mockChats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      const msgIndex = mockChats[chatIndex].messages.findIndex(m => m.id === messageId);
      if (msgIndex !== -1) {
        mockChats[chatIndex].messages[msgIndex].status = newStatus;
      }
    }
  };

  const handleSendMessage = (text: string) => {
    if (!chat) return;
    const newMessageId = `msg-${Date.now()}`;
    const newMessage: Message = {
      id: newMessageId,
      chatId: chat.id,
      senderId: effectiveUser.id, // Use effectiveUser's ID
      text,
      timestamp: Date.now(),
      isOwn: true, // It's always "own" from this client's perspective
      status: 'sent',
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    const chatIndex = mockChats.findIndex(c => c.id === chat.id);
    if (chatIndex !== -1) {
      mockChats[chatIndex].messages.push(newMessage);
      mockChats[chatIndex].lastMessage = newMessage;
    }

    // Simulate status updates for the sent message (only if not guest, or for demo)
    // For guests, these statuses might not be truly representative without a backend
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessageId ? { ...m, status: 'delivered' } : m));
      updateMessageStatusInMockData(newMessageId, 'delivered');
    }, 1500);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessageId ? { ...m, status: 'read' } : m));
      updateMessageStatusInMockData(newMessageId, 'read');
    }, 4000);
  };

  if (isLoading) {
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

  if (!chat) {
    return <div className="flex h-full items-center justify-center">Chat not found.</div>;
  }

  // Adjust participant display for header if needed
  const otherParticipants = chat.participants.filter(p => p.id !== effectiveUser.id);
  const chatName = chat.isGroup ? chat.name : otherParticipants[0]?.name;
  const chatAvatar = chat.isGroup 
    ? `https://placehold.co/100x100.png?text=${chatName?.substring(0,1)}` 
    : otherParticipants[0]?.avatarUrl;
  const chatStatus = chat.isGroup ? `${chat.participants.length} members` : otherParticipants[0]?.status;

  return (
    <div className="flex h-full max-h-[calc(100vh-theme(spacing.16))] flex-col bg-background">
      <ChatHeader 
        chatId={chat.id} 
        name={chatName || "Chat"} 
        avatarUrl={chatAvatar} 
        status={chatStatus || (chat.isGroup ? 'group' : 'offline')}
        participants={chat.participants} // Pass original participants
        isGroup={!!chat.isGroup}
      />
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} currentUser={effectiveUser} /> // Pass effectiveUser
          ))}
        </div>
      </ScrollArea>
      <ChatInput 
        onSendMessage={handleSendMessage} 
        smartReplies={isGuest ? [] : smartReplies} // No smart replies for guests
        isLoadingSmartReplies={isGuest ? false : isLoadingSmartReplies}
      />
    </div>
  );
}
