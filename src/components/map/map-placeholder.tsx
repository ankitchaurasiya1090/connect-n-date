// src/components/map/map-placeholder.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, User, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Simulated user data
const nearbyUsers = [
  { id: "user1", name: "Alex P.", distance: "0.5 km", interests: ["Hiking", "Coffee"], avatarSeed: "alex" },
  { id: "user2", name: "Maria G.", distance: "1.2 km", interests: ["Books", "Art"], avatarSeed: "maria" },
  { id: "user3", name: "Sam K.", distance: "2.0 km", interests: ["Gaming", "Tech"], avatarSeed: "sam" },
];

export function MapPlaceholder() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MapPin className="h-6 w-6 text-primary" />
            Interactive Map
          </CardTitle>
          <CardDescription>
            This is where the interactive map displaying nearby users will be.
            For privacy, exact locations are obscured. Click on a user to view their profile or start a chat.
            <br />
            <strong>Note:</strong> Map integration (e.g., Google Maps API) is required here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-[16/9] w-full bg-secondary rounded-md flex items-center justify-center border border-dashed border-primary/50">
            <div className="text-center text-primary/80 p-4">
              <MapPin className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg font-semibold">Map Area Placeholder</p>
              <p className="text-sm">Integrate your preferred map library here.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Nearby Users (Simulated)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearbyUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Image
                  src={`https://picsum.photos/seed/${user.avatarSeed}/100/100`}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="rounded-full mb-3 border-2 border-primary"
                  data-ai-hint="profile avatar"
                />
                <h3 className="font-semibold text-lg text-foreground">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.distance} away</p>
                <div className="mt-2">
                  {user.interests.map(interest => (
                    <span key={interest} className="inline-block bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full mr-1 mb-1">
                      {interest}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                     <Link href={`/users/${user.id}`}>
                       <User className="mr-1 h-4 w-4" /> Profile
                     </Link>
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/chat?with=${user.id}`}> {/* Simplified chat initiation */}
                      <MessageCircle className="mr-1 h-4 w-4" /> Chat
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
