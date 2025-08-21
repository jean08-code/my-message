
// User interface, aligning more with Firebase Auth user object
export interface User {
  uid: string; // Firebase User ID
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  // UserStatus (online/offline) is removed for simplicity with Firebase basic setup
}

// Message interface for Firestore
export interface Message {
  id: string; // Document ID from Firestore
  chatId: string;
  senderId: string; // Firebase UID of the sender
  senderName?: string | null; // displayName of the sender, denormalized for convenience
  senderPhotoURL?: string | null;
  text: string;
  timestamp: number; // Firestore serverTimestamp will be used, but number for client-side sorting
  // isOwn is a client-side helper, will be determined by comparing senderId with current user's UID
  // MessageStatus (sent/delivered/read) is removed for simplicity
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
}

// Chat interface - this will evolve as we integrate ChatList with Firestore
export interface Chat {
  id:string; // Document ID from Firestore (e.g., 'general', or an auto-generated ID)
  // Participants might be an array of UIDs or a map
  // For now, we are focusing on individual chat rooms like 'general'
  name?: string; // Name of the chat room
  // lastMessage, unreadCount etc. will be added when ChatList is built
}

export interface Story {
    id: string; // Document ID from Firestore
    userId: string; // Firebase UID of the user who posted
    userDisplayName: string | null;
    userPhotoURL: string | null;
    mediaUrl: string;
    mediaType: string; // e.g., 'image/jpeg'
    timestamp: number; // Firestore serverTimestamp as a number (milliseconds)
}


export interface NotificationSettings {
  muteAll: boolean;
  mutedChats: string[]; // Array of chat IDs
}
