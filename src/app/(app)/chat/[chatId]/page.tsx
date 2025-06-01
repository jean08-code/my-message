
"use client";

import { useEffect, useState, useRef } from 'react';
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

export default function ChatConversationPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { user: currentUser } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isLoadingSmartReplies, setIsLoadingSmartReplies] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId && currentUser) {
      setIsLoading(true);
      const foundChat = mockChats.find(c => c.id === chatId);
      if (foundChat) {
        const enrichedMessages = foundChat.messages.map(msg => ({
          ...msg,
          isOwn: msg.senderId === currentUser.id,
          // Initialize status if not present (for older mock data)
          status: msg.status || (msg.senderId === currentUser.id ? 'read' : undefined) 
        }));
        setChat(foundChat);
        setMessages(enrichedMessages);
      } else {
        setChat(null);
        setMessages([]);
      }
      setIsLoading(false);
    }
  }, [chatId, currentUser]);

  useEffect(() => {
    if (messages.length > 0) {
      fetchSmartReplies();
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }
  }, [messages]);

  const fetchSmartReplies = async () => {
    if (messages.length === 0 || !currentUser) return;
    
    // Only fetch smart replies if the last message isn't from the current user
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.senderId === currentUser.id) {
      setSmartReplies([]);
      return;
    }

    setIsLoadingSmartReplies(true);
    try {
      const lastMessagesInput = messages.slice(-5).map(msg => {
        const sender = mockUsers.find(u => u.id === msg.senderId);
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
    if (!currentUser || !chat) return;
    const newMessageId = `msg-${Date.now()}`;
    const newMessage: Message = {
      id: newMessageId,
      chatId: chat.id,
      senderId: currentUser.id,
      text,
      timestamp: Date.now(),
      isOwn: true,
      status: 'sent',
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    // Update mockChats or real DB
    const chatIndex = mockChats.findIndex(c => c.id === chat.id);
    if (chatIndex !== -1) {
      mockChats[chatIndex].messages.push(newMessage);
      mockChats[chatIndex].lastMessage = newMessage;
    }

    // Simulate status updates for the sent message
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessageId ? { ...m, status: 'delivered' } : m));
      updateMessageStatusInMockData(newMessageId, 'delivered');
    }, 1500); // Delivered after 1.5 seconds

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessageId ? { ...m, status: 'read' } : m));
      updateMessageStatusInMockData(newMessageId, 'read');
    }, 4000); // Read after 4 seconds
  };

  if (isLoading || !currentUser) {
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

  const otherParticipants = chat.participants.filter(p => p.id !== currentUser.id);
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
        participants={chat.participants}
        isGroup={!!chat.isGroup}
      />
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} currentUser={currentUser} />
          ))}
        </div>
      </ScrollArea>
      <ChatInput 
        onSendMessage={handleSendMessage} 
        smartReplies={smartReplies}
        isLoadingSmartReplies={isLoadingSmartReplies}
      />
    </div>
  );
}
