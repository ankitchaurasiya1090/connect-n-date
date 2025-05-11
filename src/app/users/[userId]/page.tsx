// src/app/users/[userId]/page.tsx
"use client"; // This page needs to be a client component to use hooks and fetch data client-side

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthenticatedPageLayout } from "@/components/layout/authenticated-page-layout";
import { ProfileCard } from "@/components/profile/profile-card";
import { IceBreakerTool } from "@/components/ai/ice-breaker-tool";
import type { UserProfile } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// This function would typically fetch user data from a backend/DB
async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}


export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const { profile: currentUserProfile, loading: authLoading } = useAuth(); // Current logged-in user's profile
  const [viewedUserProfile, setViewedUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (userId) {
      setLoadingProfile(true);
      fetchUserProfile(userId).then(profileData => {
        setViewedUserProfile(profileData);
        setLoadingProfile(false);
      });
    }
  }, [userId]);

  if (authLoading || loadingProfile) {
    return (
      <AuthenticatedPageLayout>
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-32 w-32 rounded-full mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </AuthenticatedPageLayout>
    );
  }

  if (!viewedUserProfile) {
    return (
      <AuthenticatedPageLayout title="User Not Found">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">The user profile you are looking for does not exist or could not be loaded.</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </AuthenticatedPageLayout>
    );
  }

  // Prevent viewing own profile through this page, redirect to /profile
  if (currentUserProfile && viewedUserProfile.uid === currentUserProfile.uid) {
    router.replace("/profile");
    return null; 
  }

  return (
    <AuthenticatedPageLayout title={viewedUserProfile.displayName ? `${viewedUserProfile.displayName}'s Profile` : "User Profile"}>
      <div className="max-w-2xl mx-auto space-y-6">
        <ProfileCard profile={viewedUserProfile} />
        
        <div className="flex justify-center">
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
            <Link href={`/chat?with=${viewedUserProfile.uid}`}> {/* Simplified chat initiation */}
              <MessageCircle className="mr-2 h-5 w-5" /> Chat with {viewedUserProfile.displayName}
            </Link>
          </Button>
        </div>

        {currentUserProfile && viewedUserProfile.bio && currentUserProfile.bio && (
          <IceBreakerTool
            userProfileBio={viewedUserProfile.bio || "This user hasn't written a bio yet."}
            yourProfileBio={currentUserProfile.bio || "You haven't written a bio yet."}
          />
        )}
      </div>
    </AuthenticatedPageLayout>
  );
}

// It's good practice to provide metadata, though dynamic metadata needs specific handling for [userId]
// For simplicity, a generic title is used here.
// export const metadata = { title: "User Profile | Connect Nearby" };
// Dynamic metadata generation:
// export async function generateMetadata({ params }: { params: { userId: string } }) {
//   const user = await fetchUserProfile(params.userId);
//   return {
//     title: `${user?.displayName || 'User Profile'} | Connect Nearby`,
//   };
// }
