// src/components/auth/auth-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User as UserIcon, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// Firebase Auth
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseProfile
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";

const signupSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signinSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type AuthFormProps = {
  mode: "signin" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const formSchema = mode === "signup" ? signupSchema : signinSchema;
  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    } as FormData, // Cast to FormData because displayName is optional in signinSchema
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "signup") {
          const { displayName, email, password } = data as z.infer<typeof signupSchema>;
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // Update Firebase Auth profile
          await updateFirebaseProfile(user, { displayName });

          // Create user profile in Firestore
          const userProfileData: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            bio: "Just joined Connect Nearby!",
            photoURL: `https://picsum.photos/seed/${user.uid}/200/200`, // Placeholder avatar
          };
          await setDoc(doc(db, "users", user.uid), userProfileData);

          toast({ title: "Account Created", description: "Welcome to Connect Nearby!" });
        } else {
          const { email, password } = data as z.infer<typeof signinSchema>;
          await signInWithEmailAndPassword(auth, email, password);
          toast({ title: "Signed In", description: "Welcome back!" });
        }
        
        // Set auth cookie for middleware (simplified - real implementation needs secure cookie handling)
        const idToken = await auth.currentUser?.getIdToken();
        if (idToken) {
          document.cookie = `firebaseIdToken=${idToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        }
        
        const redirectedFrom = searchParams.get("redirectedFrom");
        router.push(redirectedFrom || "/dashboard");
        router.refresh(); // Important to re-trigger middleware/layout checks
      } catch (err: any) {
        console.error(`${mode} error:`, err);
        setError(err.message || `Failed to ${mode}. Please try again.`);
        toast({
          title: `${mode === "signup" ? "Sign Up" : "Sign In"} Failed`,
          description: err.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">
          {mode === "signup" ? "Create an Account" : "Welcome Back!"}
        </CardTitle>
        <CardDescription>
          {mode === "signup"
            ? "Enter your details to join Connect Nearby."
            : "Sign in to continue your journey."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 p-3 rounded-md flex items-center text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
            {mode === "signup" && (
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Your Name" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="email" placeholder="you@example.com" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Processing..." : (mode === "signup" ? "Sign Up" : "Sign In")}
            </Button>
            <p className="text-sm text-muted-foreground">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link href="/signin">Sign In</Link>
                  </Button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
