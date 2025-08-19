
"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "../ui/input";
import { Search, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function ChatList() {
  const { user: currentUser } = useAuth();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !currentUser) {
      setLoading(false);
      return;
    }

    const usersColRef = collection(db, 'users');
    const q = query(usersColRef, orderBy('displayName', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedUsers: User[] = [];
      querySnapshot.forEach((doc) => {
        // We only want to list OTHER users, not the current user
        if (doc.id !== currentUser.uid) {
           fetchedUsers.push({
            uid: doc.id,
            ...doc.data()
          } as User);
        }
      });
      setUsers(fetchedUsers);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Helper to create a consistent chat ID for 1-on-1 chats
  const createChatId = (otherUserUid: string) => {
    if (!currentUser) return '';
    // Sort UIDs to ensure the ID is the same regardless of who starts the chat
    return [currentUser.uid, otherUserUid].sort().join('_');
  };

  return (
    <div className="flex h-full flex-col border-r bg-card">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold tracking-tight">Conversations</h2>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!isFirebaseConfigured}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
            <h3 className="px-2 pt-2 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Users</h3>

            {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-md p-2">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))
            ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                    const chatId = createChatId(user.uid);
                    const fallback = user.displayName ? user.displayName.substring(0, 2).toUpperCase() : '??';
                    return (
                        <Link href={`/chat/${chatId}`} key={user.uid} legacyBehavior>
                            <a className={cn(
                                "flex items-center gap-3 rounded-md p-2 text-sm font-medium transition-colors hover:bg-muted",
                                pathname === `/chat/${chatId}` ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                            )}>
                                <Avatar className="h-9 w-9 border">
                                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} data-ai-hint="user avatar" />
                                    <AvatarFallback>{fallback}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 truncate">
                                    <p className="font-semibold">{user.displayName}</p>
                                    <p className="text-xs">Direct Message</p>
                                </div>
                            </a>
                        </Link>
                    )
                })
            ) : (
                <p className="p-4 text-center text-sm text-muted-foreground">No other users found.</p>
            )}
        </nav>
      </ScrollArea>
    </div>
  );
}
