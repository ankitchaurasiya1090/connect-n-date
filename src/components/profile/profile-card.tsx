// src/components/profile/profile-card.tsx
import type { UserProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, MapPin as LocationPin, User as UserIcon } from "lucide-react"; // Renamed MapPin to avoid conflict

interface ProfileCardProps {
  profile: UserProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader className="items-center text-center">
        <Avatar className="h-24 w-24 mb-4 border-4 border-primary shadow-md">
          <AvatarImage src={profile.photoURL || undefined} alt={profile.displayName || "User"} data-ai-hint="user avatar" />
          <AvatarFallback className="text-4xl">
             {profile.displayName?.charAt(0).toUpperCase() || <UserIcon size={48} />}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-3xl text-primary">{profile.displayName}</CardTitle>
        {profile.email && (
          <CardDescription className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" /> {profile.email}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.bio && (
          <div>
            <h4 className="font-semibold text-foreground mb-1">Bio</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/30 p-3 rounded-md">{profile.bio}</p>
          </div>
        )}
        {profile.location && ( // Placeholder for location display
          <div>
            <h4 className="font-semibold text-foreground mb-1">Location</h4>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <LocationPin className="h-4 w-4" /> Near you (Location details would go here)
            </p>
          </div>
        )}
        {/* Add more profile details here as needed */}
        {/* For example, interests, etc. */}
      </CardContent>
    </Card>
  );
}
