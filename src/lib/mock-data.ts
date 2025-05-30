import type { User, Chat, Message } from './types';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Alice Wonderland', email: 'alice@example.com', avatarUrl: 'https://placehold.co/100x100.png?text=AW', status: 'online' },
  { id: 'user-2', name: 'Bob The Builder', email: 'bob@example.com', avatarUrl: 'https://placehold.co/100x100.png?text=BB', status: 'offline' },
  { id: 'user-3', name: 'Charlie Brown', email: 'charlie@example.com', avatarUrl: 'https://placehold.co/100x100.png?text=CB', status: 'away' },
  { id: 'user-4', name: 'Diana Prince', email: 'diana@example.com', avatarUrl: 'https://placehold.co/100x100.png?text=DP', status: 'online' },
  { id: 'user-current', name: 'Current User', email: 'me@example.com', avatarUrl: 'https://placehold.co/100x100.png?text=ME', status: 'online' }, // Represents the logged-in user
];

export const mockMessages: Message[] = [
  { id: 'msg-1', chatId: 'chat-1', senderId: 'user-1', text: 'Hey Bob, how are you?', timestamp: Date.now() - 1000 * 60 * 5, isOwn: false },
  { id: 'msg-2', chatId: 'chat-1', senderId: 'user-current', text: 'Hi Alice! I am good, thanks. Finishing up a project.', timestamp: Date.now() - 1000 * 60 * 4, isOwn: true },
  { id: 'msg-3', chatId: 'chat-1', senderId: 'user-1', text: 'Sounds great! Let me know if you need help.', timestamp: Date.now() - 1000 * 60 * 3, isOwn: false },
  { id: 'msg-4', chatId: 'chat-2', senderId: 'user-3', text: 'Good grief, another rainy day.', timestamp: Date.now() - 1000 * 60 * 10, isOwn: false },
  { id: 'msg-5', chatId: 'chat-2', senderId: 'user-current', text: 'Tell me about it, Charlie!', timestamp: Date.now() - 1000 * 60 * 9, isOwn: true },
  { id: 'msg-6', chatId: 'chat-3', senderId: 'user-4', text: 'Meeting at 3 PM today for the project update.', timestamp: Date.now() - 1000 * 60 * 60, isOwn: false },
  { id: 'msg-7', chatId: 'chat-3', senderId: 'user-current', text: 'Got it, Diana. I\'ll be there.', timestamp: Date.now() - 1000 * 60 * 59, isOwn: true },
  { id: 'msg-8', chatId: 'chat-3', senderId: 'user-1', text: 'I can join too if needed.', timestamp: Date.now() - 1000 * 60 * 58, isOwn: false },
];

export const mockChats: Chat[] = [
  {
    id: 'chat-1',
    participants: [mockUsers.find(u => u.id === 'user-current')!, mockUsers.find(u => u.id === 'user-1')!],
    messages: mockMessages.filter(m => m.chatId === 'chat-1'),
    name: 'Alice Wonderland',
    lastMessage: mockMessages.find(m => m.id === 'msg-3'),
    unreadCount: 1,
    isGroup: false,
  },
  {
    id: 'chat-2',
    participants: [mockUsers.find(u => u.id === 'user-current')!, mockUsers.find(u => u.id === 'user-3')!],
    messages: mockMessages.filter(m => m.chatId === 'chat-2'),
    name: 'Charlie Brown',
    lastMessage: mockMessages.find(m => m.id === 'msg-5'),
    unreadCount: 0,
    isGroup: false,
  },
  {
    id: 'chat-3',
    participants: [mockUsers.find(u => u.id === 'user-current')!, mockUsers.find(u => u.id === 'user-4')!, mockUsers.find(u => u.id === 'user-1')!],
    messages: mockMessages.filter(m => m.chatId === 'chat-3'),
    name: 'Project Alpha Team',
    lastMessage: mockMessages.find(m => m.id === 'msg-8'),
    unreadCount: 3,
    isGroup: true,
  },
];
