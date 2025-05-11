// src/components/chat/chat-input.tsx
"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (messageText: string) => Promise<void>; // Make it async
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage(""); // Clear input only on successful send
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally show a toast message for failure
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t bg-background">
      <Input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 rounded-full px-4 py-2 focus-visible:ring-primary"
        disabled={disabled || isSending}
      />
      <Button type="submit" size="icon" className="rounded-full bg-primary hover:bg-primary/90" disabled={disabled || isSending || !message.trim()}>
        {isSending ? <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" /> : <Send className="h-5 w-5 text-primary-foreground" />}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
