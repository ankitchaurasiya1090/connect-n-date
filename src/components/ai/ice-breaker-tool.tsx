// src/components/ai/ice-breaker-tool.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestIceBreaker, type SuggestIceBreakerInput } from "@/ai/flows/suggest-ice-breaker"; // Ensure this path is correct

interface IceBreakerToolProps {
  userProfileBio: string;    // The bio of the user you want to talk to
  yourProfileBio: string;    // Your own bio
  onSuggested?: (icebreaker: string) => void; // Optional: callback when suggestion is made
}

export function IceBreakerTool({ userProfileBio, yourProfileBio, onSuggested }: IceBreakerToolProps) {
  const [icebreaker, setIcebreaker] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleSuggestIcebreaker = async () => {
    setIsLoading(true);
    setIcebreaker("");
    startTransition(async () => {
      try {
        const input: SuggestIceBreakerInput = {
          userProfile: userProfileBio,
          yourProfile: yourProfileBio,
        };
        const result = await suggestIceBreaker(input);
        if (result.icebreaker) {
          setIcebreaker(result.icebreaker);
          onSuggested?.(result.icebreaker);
          toast({ title: "Icebreaker Suggested!", description: "Here's a conversation starter." });
        } else {
          throw new Error("No icebreaker returned from AI.");
        }
      } catch (error: any) {
        console.error("Error suggesting icebreaker:", error);
        toast({
          title: "Suggestion Failed",
          description: error.message || "Could not generate an icebreaker.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <Card className="w-full shadow-md mt-6 bg-gradient-to-br from-accent/50 to-secondary/30 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <Wand2 className="h-6 w-6" />
          AI Icebreaker Assistant
        </CardTitle>
        <CardDescription>
          Need help starting the conversation? Let our AI suggest an opening line based on your profiles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {icebreaker && (
          <div className="mb-4 p-4 bg-background rounded-md shadow">
            <p className="font-semibold text-foreground mb-1">Suggested Icebreaker:</p>
            <p className="text-sm text-muted-foreground italic">&quot;{icebreaker}&quot;</p>
          </div>
        )}
        {userProfileBio && yourProfileBio ? (
           <Button onClick={handleSuggestIcebreaker} disabled={isLoading || isPending} className="w-full">
            {isLoading || isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Suggest an Icebreaker
              </>
            )}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            User profiles are needed to suggest an icebreaker.
            Ensure both your profile and the other user&apos;s profile have bios.
          </p>
        )}
      </CardContent>
      {icebreaker && (
         <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                Use this suggestion to start a chat or try generating another one!
            </p>
         </CardFooter>
      )}
    </Card>
  );
}
