// src/components/profile/profile-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { updateProfile as updateFirebaseProfile } from "firebase/auth";
import type { UserProfile } from "@/lib/types";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";

const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters.").max(50),
  bio: z.string().max(160, "Bio must be 160 characters or less.").optional(),
  photoURL: z.string().url("Invalid URL format for photo.").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user, profile, fetchProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      photoURL: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        photoURL: profile.photoURL || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user || !auth.currentUser) {
      toast({ title: "Error", description: "You must be signed in to update your profile.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      try {
        // Update Firebase Auth profile (only displayName and photoURL can be directly updated here)
        await updateFirebaseProfile(auth.currentUser!, { 
          displayName: data.displayName,
          photoURL: data.photoURL || null, // Firebase expects null for empty photoURL
        });

        // Update Firestore profile document
        const userDocRef = doc(db, "users", user.uid);
        const updatedProfileData: Partial<UserProfile> = {
          displayName: data.displayName,
          bio: data.bio,
          photoURL: data.photoURL,
        };
        await setDoc(userDocRef, updatedProfileData, { merge: true });
        
        await fetchProfile(); // Re-fetch profile to update context

        toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      } catch (error: any) {
        console.error("Error updating profile:", error);
        toast({ title: "Update Failed", description: error.message || "Could not update profile.", variant: "destructive" });
      }
    });
  };

  if (authLoading) {
    return <Card><CardContent className="p-6">Loading profile...</CardContent></Card>;
  }
  
  if (!profile && !authLoading) {
     return <Card><CardContent className="p-6">Could not load profile. Please try again later.</CardContent></Card>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Edit Your Profile</CardTitle>
        <CardDescription>Make changes to your public profile. This information will be visible to other users.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                 <AvatarImage src={form.watch("photoURL") || profile?.photoURL || undefined} alt={profile?.displayName || "User"} data-ai-hint="user avatar" />
                 <AvatarFallback className="text-3xl">
                    {profile?.displayName?.charAt(0).toUpperCase() || <UserIcon size={40} />}
                 </AvatarFallback>
              </Avatar>
              <FormField
                control={form.control}
                name="photoURL"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Profile Picture URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/your-image.png" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a URL for your profile picture. Use a square image for best results. (e.g., from picsum.photos)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A short bio to introduce yourself to others. Max 160 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending || !form.formState.isDirty} className="ml-auto">
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
