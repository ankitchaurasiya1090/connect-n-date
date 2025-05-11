// src/components/chat/message-bubble.tsx
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  senderPhotoURL?: string;
  senderDisplayName?: string;
}

export function MessageBubble({ message, isOwnMessage, senderPhotoURL, senderDisplayName }: MessageBubbleProps) {
  const initials = senderDisplayName ? senderDisplayName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'U';
  return (
    <div className={cn("flex items-end gap-2 mb-4", isOwnMessage ? "justify-end" : "justify-start")}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 self-start">
          <AvatarImage src={senderPhotoURL} alt={senderDisplayName || "Sender"} data-ai-hint="user avatar" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] p-3 rounded-xl shadow-md",
          isOwnMessage
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none"
        )}
      >
        <p className="text-sm break-words">{message.text}</p>
        <p className={cn("text-xs mt-1", isOwnMessage ? "text-primary-foreground/70 text-right" : "text-muted-foreground/70 text-left")}>
          {format(new Date(message.timestamp), "p")}
        </p>
      </div>
       {isOwnMessage && (
        <Avatar className="h-8 w-8 self-start">
          <AvatarImage src={senderPhotoURL} alt={senderDisplayName || "You"} data-ai-hint="user avatar" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
