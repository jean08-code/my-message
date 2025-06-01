
// src/lib/mock-data.ts
// This file is largely deprecated as the application moves to Firebase/Firestore for data.
// It's kept here for reference or potential future use for local-only fallbacks or testing.

/*
import type { User, Chat, Message } from './types';

// Original mockUsers - now handled by Firebase Auth and Firestore 'users' collection
export const mockUsers: User[] = [
  // ... user data ...
];

// Original mockMessages - now stored in Firestore under 'chats/{chatId}/messages'
export const mockMessages: Message[] = [
  // ... message data ...
];

// Original mockChats - chat structure will be managed in Firestore 'chats' collection
export const mockChats: Chat[] = [
  // ... chat data ...
];
*/

console.warn(
  "src/lib/mock-data.ts is deprecated. Application is using Firebase/Firestore for data."
);

// You can export empty arrays or structures if other parts of the app still import them
// and expect them to exist, to avoid import errors during transition.
export const mockUsers: any[] = [];
export const mockMessages: any[] = [];
export const mockChats: any[] = [];
