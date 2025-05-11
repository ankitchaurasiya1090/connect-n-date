// src/ai/flows/suggest-ice-breaker.ts
'use server';

/**
 * @fileOverview AI-powered icebreaker suggestion flow.
 *
 * - suggestIceBreaker - A function that suggests an icebreaker based on user profiles.
 * - SuggestIceBreakerInput - The input type for the suggestIceBreaker function.
 * - SuggestIceBreakerOutput - The return type for the suggestIceBreaker function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestIceBreakerInputSchema = z.object({
  userProfile: z
    .string()
    .describe('The profile text of the user you want to chat with.'),
  yourProfile: z
    .string()
    .describe('Your own profile text.'),
});
export type SuggestIceBreakerInput = z.infer<typeof SuggestIceBreakerInputSchema>;

const SuggestIceBreakerOutputSchema = z.object({
  icebreaker: z.string().describe('An opening line or question to start a conversation.'),
});
export type SuggestIceBreakerOutput = z.infer<typeof SuggestIceBreakerOutputSchema>;

export async function suggestIceBreaker(input: SuggestIceBreakerInput): Promise<SuggestIceBreakerOutput> {
  return suggestIceBreakerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestIceBreakerPrompt',
  input: {schema: SuggestIceBreakerInputSchema},
  output: {schema: SuggestIceBreakerOutputSchema},
  prompt: `You are a helpful assistant that suggests icebreakers to start conversations.

  Given the profiles of two users, suggest an opening line or question that one user can use to start a conversation with the other.
  The icebreaker should be friendly, engaging, and relevant to the users' profiles.

  Your Profile: {{{yourProfile}}}
  Other User's Profile: {{{userProfile}}}

  Suggest an icebreaker:
  `,
});

const suggestIceBreakerFlow = ai.defineFlow(
  {
    name: 'suggestIceBreakerFlow',
    inputSchema: SuggestIceBreakerInputSchema,
    outputSchema: SuggestIceBreakerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

