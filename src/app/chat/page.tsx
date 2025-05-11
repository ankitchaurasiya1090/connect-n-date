// src/app/chat/page.tsx
"use client";

import { AuthenticatedPageLayout } from "@/components/layout/authenticated-page-layout";
import { ChatListItem } from "@/components/chat/chat-list-item";
import type { ChatConversation } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

// Simulated data - replace with actual data fetching from Firestore
const getSimulatedConversations = (currentUserId: string): ChatConversation[] => [
  {
    id: "convo1",
    participants: [currentUserId, "user2"],
    participantNames: {[currentUserId]: "You", "user2": "Maria G."},
    participantPhotoURLs: {[currentUserId]: "https://picsum.photos/seed/you/100", "user2": "https://picsum.photos/seed/maria/100"},
    lastMessage: { id: "msg1", senderId: "user2", receiverId: currentUserId, text: "Hey, how are you doing?", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "convo2",
    participants: [currentUserId, "user3"],
    participantNames: {[currentUserId]: "You", "user3": "Sam K."},
    participantPhotoURLs: {[currentUserId]: "https://picsum.photos/seed/you/100", "user3": "https://picsum.photos/seed/sam/100"},
    lastMessage: { id: "msg2", senderId: currentUserId, receiverId: "user3", text: "Let's catch up later!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "convo3",
    participants: [currentUserId, "user4"],
    participantNames: {[currentUserId]: "You", "user4": "Lisa B."},
    participantPhotoURLs: {[currentUserId]: "https://picsum.photos/seed/you/100", "user4": "https://picsum.photos/seed/lisa/100"},
    lastMessage: { id: "msg3", senderId: "user4", receiverId: currentUserId, text: "Thanks for the tip!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];


export default function ChatListPage() {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Simulate fetching conversations
  useEffect(() => {
    if (user) {
      // In a real app, fetch conversations from Firestore here
      // For now, using simulated data
      setConversations(getSimulatedConversations(user.uid).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      setLoadingConversations(false);
    } else if (!authLoading) {
      // If not loading and no user, means not authenticated
      setLoadingConversations(false);
    }
  }, [user, authLoading]);

  const filteredConversations = conversations.filter(convo => {
    const otherParticipantId = convo.participants.find(id => id !== user?.uid);
    const otherParticipantName = otherParticipantId ? (convo.participantNames?.[otherParticipantId] || "") : "";
    return otherParticipantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           convo.lastMessage?.text.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (authLoading || (user && loadingConversations)) {
    return (
      <AuthenticatedPageLayout title="Chats">
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      </AuthenticatedPageLayout>
    );
  }
  
  if (!user) {
     return (
      <AuthenticatedPageLayout title="Chats">
         <p>Please sign in to view your chats.</p>
      </AuthenticatedPageLayout>
    );
  }

  return (
    <AuthenticatedPageLayout title="Chats" containerClassName="container py-8 flex flex-col h-[calc(100vh-4rem-1px)]"> {/* Adjust height based on header/footer */}
      <Card className="flex-1 flex flex-col shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Your Conversations</CardTitle>
              <CardDescription>Select a conversation to start chatting.</CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard"> {/* Link to find new users */}
                <MessageSquarePlus className="mr-2 h-4 w-4" /> New Chat
              </Link>
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search chats..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            <div className="divide-y">
              {filteredConversations.map((convo) => (
                <ChatListItem key={convo.id} conversation={convo} currentUserId={user.uid} />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <p>{searchTerm ? "No conversations match your search." : "You have no conversations yet."}</p>
              <p className="mt-2">Start a new chat by finding users on the dashboard!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthenticatedPageLayout>
  );
}

// export const metadata = { title: "Chat | Connect Nearby" }; // Static metadata for now
