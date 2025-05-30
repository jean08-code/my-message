"use client";

import React from 'react';
import { ChatList } from '@/components/chat/chat-list';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'; // Assuming this is added if not using sidebar for chat list

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout uses ResizablePanelGroup. If not available,
  // ChatList could be part of AppSidebar or a fixed panel.
  // For now, assuming ChatList is handled by AppSidebar and this layout just passes children.
  // If AppSidebar integrates ChatList directly, this layout might be simpler or not needed.
  // Given AppSidebar structure, let's simplify this: ChatList will be a component rendered
  // inside the chat pages rather than a structural layout element here.
  // This layout will just provide a container for /chat and /chat/[chatId]

  // Updated approach: The (app)/layout.tsx provides the main sidebar.
  // The chat page itself can have a two-column layout if needed (ChatList + ChatView)
  // For now, let's assume chat list is part of the global sidebar when on /chat routes,
  // or displayed differently. For a simpler first pass, this layout can be minimal.
  // If the ChatList is part of the main AppSidebar, this layout might not be strictly needed,
  // or it could manage a secondary sidebar specific to chats.

  // Let's use a ResizablePanelGroup for ChatList and ChatView
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full max-h-[calc(100vh-theme(spacing.16))] rounded-lg border-0">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
        <div className="h-full overflow-y-auto p-0">
          <ChatList />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle className="bg-border w-2 hover:bg-primary/20 transition-colors" />
      <ResizablePanel defaultSize={75}>
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
