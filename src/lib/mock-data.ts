
import type { User, Chat, Message } from './types';

export const mockUsers: User[] = [
  { 
    id: 'user-current', 
    name: 'Me (Current User)', 
    email: 'me@example.com', 
    avatarUrl: 'https://placehold.co/100x100.png?text=ME', 
    status: 'online' 
  },
  { 
    id: 'user-demo', 
    name: 'Demo Contact', 
    email: 'demo@example.com', 
    avatarUrl: 'https://placehold.co/100x100.png?text=DC', 
    status: 'online' 
  },
];

// Get the actual user objects for cleaner referencing
const currentUser = mockUsers.find(u => u.id === 'user-current')!;
const demoUser = mockUsers.find(u => u.id === 'user-demo')!;

export const mockMessages: Message[] = [
  { 
    id: 'msg-demo-1', 
    chatId: 'chat-demo-1', 
    senderId: demoUser.id, 
    text: 'Hello there! This is a demo chat.', 
    timestamp: Date.now() - 1000 * 60 * 5, 
    isOwn: false, // This will be dynamically set based on logged-in user
    status: 'read',
  },
  { 
    id: 'msg-demo-2', 
    chatId: 'chat-demo-1', 
    senderId: currentUser.id, 
    text: 'Hi Demo Contact! Looks good.', 
    timestamp: Date.now() - 1000 * 60 * 4, 
    isOwn: true, // This will be dynamically set
    status: 'read',
  },
];

export const mockChats: Chat[] = [
  {
    id: 'chat-demo-1',
    participants: [currentUser, demoUser],
    messages: mockMessages.filter(m => m.chatId === 'chat-demo-1'),
    name: 'Demo Contact', // For 1:1 chat, usually the other person's name
    lastMessage: mockMessages.find(m => m.id === 'msg-demo-2'),
    unreadCount: 0,
    isGroup: false,
  },
];
