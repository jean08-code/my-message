
export type UserStatus = 'online' | 'offline' | 'away' | 'dnd'; // dnd = Do Not Disturb

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  status: UserStatus;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number; // Use number (timestamp) for easier sorting and consistent Date handling
  isOwn?: boolean; // UI helper, set on client
  status?: MessageStatus; // For sent, delivered, read status
}

export interface Chat {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
  name?: string; // For group chats, or participant names for 1:1
  isGroup?: boolean;
  typingUserIds?: string[]; // IDs of users currently typing
}

export interface NotificationSettings {
  muteAll: boolean;
  mutedChats: string[]; // Array of chat IDs
}
