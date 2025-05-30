'use server';

/**
 * @fileOverview Generates smart replies based on the latest messages in a conversation.
 *
 * - generateSmartReplies - A function that generates smart reply suggestions.
 * - GenerateSmartRepliesInput - The input type for the generateSmartReplies function.
 * - GenerateSmartRepliesOutput - The return type for the generateSmartReplies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSmartRepliesInputSchema = z.object({
  messages: z
    .array(
      z.object({
        sender: z.string().describe('The sender of the message.'),
        text: z.string().describe('The content of the message.'),
      })
    )
    .describe('The latest messages in the conversation.'),
});
export type GenerateSmartRepliesInput = z.infer<typeof GenerateSmartRepliesInputSchema>;

const GenerateSmartRepliesOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggested replies based on the latest messages.'),
});
export type GenerateSmartRepliesOutput = z.infer<typeof GenerateSmartRepliesOutputSchema>;

export async function generateSmartReplies(
  input: GenerateSmartRepliesInput
): Promise<GenerateSmartRepliesOutput> {
  return generateSmartRepliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSmartRepliesPrompt',
  input: {schema: GenerateSmartRepliesInputSchema},
  output: {schema: GenerateSmartRepliesOutputSchema},
  prompt: `You are a helpful assistant designed to suggest smart replies for a conversation.
  Given the following recent messages, suggest three short replies that the user could send next.
  The replies should be appropriate for the context of the conversation and should be no more than 20 words each.

  Messages:
  {{#each messages}}
  {{sender}}: {{text}}
  {{/each}}

  Suggestions:
  {{#each suggestions}}
  - {{this}}
  {{/each}}`,
});

const generateSmartRepliesFlow = ai.defineFlow(
  {
    name: 'generateSmartRepliesFlow',
    inputSchema: GenerateSmartRepliesInputSchema,
    outputSchema: GenerateSmartRepliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
