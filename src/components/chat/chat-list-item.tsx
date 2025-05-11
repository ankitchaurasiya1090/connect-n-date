// src/components/chat/chat-list-item.tsx
import type { ChatConversation } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { User } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface ChatListItemProps {
  conversation: ChatConversation;
  currentUserId: string; // To determine the other participant
}

export function ChatListItem({ conversation, currentUserId }: ChatListItemProps) {
  // Determine the other participant
  const otherParticipantId = conversation.participants.find(id => id !== currentUserId);
  const otherParticipantName = otherParticipantId ? (conversation.participantNames?.[otherParticipantId] || "Unknown User") : "Unknown User";
  const otherParticipantPhotoURL = otherParticipantId ? (conversation.participantPhotoURLs?.[otherParticipantId]) : undefined;


  return (
    <Link href={`/chat/${conversation.id}`} className="block hover:bg-accent/50 transition-colors rounded-lg">
      <div className="flex items-center p-3 space-x-3">
        <Avatar className="h-12 w-12 border-2 border-primary/50">
          <AvatarImage src={otherParticipantPhotoURL} alt={otherParticipantName} data-ai-hint="user avatar" />
          <AvatarFallback className="text-xl">
            {otherParticipantName.charAt(0).toUpperCase() || <User />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <p className="text-md font-semibold text-foreground truncate">{otherParticipantName}</p>
            {conversation.updatedAt && (
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {conversation.lastMessage?.text || "No messages yet."}
          </p>
        </div>
      </div>
    </Link>
  );
}
