// src/app/chat/[chatId]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthenticatedPageLayout } from "@/components/layout/authenticated-page-layout";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageBubble } from "@/components/chat/message-bubble";
import type { ChatMessage, ChatConversation, UserProfile } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User as UserIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

// Simulated data fetching functions
async function fetchChatConversationDetails(chatId: string, currentUserId: string): Promise<{ conversation: ChatConversation | null, otherParticipant: UserProfile | null }> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  if (chatId === "convo1") {
    const otherUserId = "user2";
    return {
      conversation: {
        id: "convo1",
        participants: [currentUserId, otherUserId],
        participantNames: {[currentUserId]: "You", [otherUserId]: "Maria G."},
        participantPhotoURLs: {[currentUserId]: "https://picsum.photos/seed/you/100", [otherUserId]: "https://picsum.photos/seed/maria/100"},
        updatedAt: new Date(),
      },
      otherParticipant: {
        uid: otherUserId,
        displayName: "Maria G.",
        email: "maria@example.com",
        photoURL: "https://picsum.photos/seed/maria/100",
        bio: "Loves books and art.",
      }
    };
  }
  return { conversation: null, otherParticipant: null };
}

async function fetchChatMessages(chatId: string): Promise<ChatMessage[]> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  if (chatId === "convo1") {
    return [
      { id: "msg1", senderId: "user2", receiverId: "currentUser", text: "Hey, how are you doing?", timestamp: new Date(Date.now() - 1000 * 60 * 7) },
      { id: "msg2", senderId: "currentUser", receiverId: "user2", text: "I'm good, thanks! How about you?", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
      { id: "msg3", senderId: "user2", receiverId: "currentUser", text: "Doing well! Just finished a great book.", timestamp: new Date(Date.now() - 1000 * 60 * 3) },
    ].map(msg => ({ ...msg, senderId: msg.senderId === "currentUser" ? "simulatedCurrentUserId" : msg.senderId })); // Adjust senderId for simulation
  }
  return [];
}

async function sendChatMessage(chatId: string, senderId: string, receiverId: string, text: string): Promise<ChatMessage> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const newMessage: ChatMessage = {
        id: `msg${Date.now()}`,
        senderId,
        receiverId,
        text,
        timestamp: new Date(),
    };
    console.log("Simulated sending message:", newMessage);
    return newMessage;
}


export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;
  const { user, profile: currentUserProfile, loading: authLoading } = useAuth();

  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [otherParticipant, setOtherParticipant] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId && user) {
      setLoading(true);
      Promise.all([
        fetchChatConversationDetails(chatId, user.uid),
        fetchChatMessages(chatId)
      ]).then(([{ conversation: convoData, otherParticipant: otherUserData }, msgsData]) => {
        // Adjust senderId for simulated messages
        const adjustedMessages = msgsData.map(msg => ({
          ...msg,
          senderId: msg.senderId === "simulatedCurrentUserId" ? user.uid : msg.senderId
        }));
        setConversation(convoData);
        setOtherParticipant(otherUserData);
        setMessages(adjustedMessages.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
        setLoading(false);
      }).catch(err => {
        console.error("Error fetching chat data:", err);
        setLoading(false);
        // Handle error, e.g. redirect or show message
      });
    } else if (!authLoading && !user) {
       router.push("/signin"); // Redirect if not authenticated
    }
  }, [chatId, user, authLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    if (!user || !otherParticipant) return;
    // In a real app, this would send the message to Firestore/backend
    const newMessage = await sendChatMessage(chatId, user.uid, otherParticipant.uid, messageText);
    setMessages(prevMessages => [...prevMessages, { ...newMessage, senderId: user.uid }]); // Optimistically update UI
  };
  
  if (authLoading || loading) {
    return (
      <AuthenticatedPageLayout title="Loading Chat...">
        <div className="flex flex-col h-[calc(100vh-10rem)]"> {/* Adjust height */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <Skeleton className={`h-12 w-1/2 rounded-lg ${i % 2 === 0 ? 'mr-auto' : 'ml-auto' }`} />
              </div>
            ))}
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      </AuthenticatedPageLayout>
    );
  }

  if (!conversation || !otherParticipant) {
    return (
      <AuthenticatedPageLayout title="Chat Not Found">
        <div className="text-center">
            <p className="text-lg text-muted-foreground">This chat could not be loaded or does not exist.</p>
            <Button onClick={() => router.push("/chat")} variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chats
            </Button>
        </div>
      </AuthenticatedPageLayout>
    );
  }


  return (
    <AuthenticatedPageLayout 
      title="" // Title is handled by the custom header below
      containerClassName="p-0 flex flex-col h-[calc(100vh-4rem-1px)] max-w-4xl mx-auto" // Full height chat window
    >
      {/* Custom Chat Header */}
      <div className="flex items-center p-3 border-b bg-card sticky top-[4rem-1px] z-10"> {/* Sticky header below main AppHeader */}
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/chat")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Link href={`/users/${otherParticipant.uid}`} className="flex items-center gap-3 hover:bg-accent/50 p-1 rounded-md transition-colors">
            <Avatar className="h-10 w-10 border">
                <AvatarImage src={otherParticipant.photoURL || undefined} alt={otherParticipant.displayName || "User"} data-ai-hint="user avatar" />
                <AvatarFallback>{otherParticipant.displayName?.charAt(0).toUpperCase() || <UserIcon />}</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-md font-semibold text-foreground">{otherParticipant.displayName}</h2>
                <p className="text-xs text-muted-foreground">Active now (simulated)</p>
            </div>
        </Link>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-secondary/20">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwnMessage={msg.senderId === user?.uid}
            senderPhotoURL={msg.senderId === user?.uid ? currentUserProfile?.photoURL : otherParticipant?.photoURL}
            senderDisplayName={msg.senderId === user?.uid ? currentUserProfile?.displayName : otherParticipant?.displayName}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <ChatInput onSendMessage={handleSendMessage} />
    </AuthenticatedPageLayout>
  );
}

// export const metadata = { title: "Chat | Connect Nearby" }; // Static metadata for now
