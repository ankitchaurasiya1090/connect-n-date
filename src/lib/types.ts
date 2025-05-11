// src/lib/types.ts
import type { User as FirebaseUser } from "firebase/auth";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  bio?: string;
  photoURL?: string; // For profile picture
  location?: { // Simplified location, exact coordinates should not be stored directly if privacy is key
    latitude: number;
    longitude: number;
  } | null;
  // Add other profile fields as needed
}

export interface AppUser extends FirebaseUser {
  profile?: UserProfile;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date; // Or Firestore Timestamp
  senderName?: string; // Optional: denormalize for display
}

export interface ChatConversation {
  id: string; // Typically a composite key or generated ID
  participants: string[]; // Array of user UIDs
  lastMessage?: ChatMessage; // For preview
  updatedAt: Date; // Or Firestore Timestamp
  participantNames?: { [uid: string]: string };
  participantPhotoURLs?: { [uid: string]: string };
}
