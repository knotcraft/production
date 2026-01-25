'use server';

/**
 * @fileOverview Generates wedding theme ideas based on user preferences and budget.
 *
 * - generateThemeIdeas - A function that generates wedding theme ideas.
 * - ThemeInspirationInput - The input type for the generateThemeIdeas function.
 * - ThemeInspirationOutput - The return type for the generateThemeIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ThemeInspirationInputSchema = z.object({
  theme: z.string().describe('The desired wedding theme (e.g., rustic, modern, classic).'),
  style: z.string().describe('The wedding style (e.g., formal, casual, bohemian).'),
  budget: z.string().describe('The budget range for the wedding (e.g., $5,000-$10,000, $10,000-$20,000, $20,000+).'),
});
export type ThemeInspirationInput = z.infer<typeof ThemeInspirationInputSchema>;

const ThemeInspirationOutputSchema = z.object({
  ideas: z.array(
    z.object({
      decorationIdeas: z.string().describe('Suggestions for decorations based on the theme and style.'),
      venueIdeas: z.string().describe('Venue suggestions that match the specified theme and budget.'),
      musicIdeas: z.string().describe('Music and entertainment suggestions appropriate for the wedding.'),
    })
  ).describe('An array of wedding theme ideas.')
});
export type ThemeInspirationOutput = z.infer<typeof ThemeInspirationOutputSchema>;

export async function generateThemeIdeas(input: ThemeInspirationInput): Promise<ThemeInspirationOutput> {
  return themeInspirationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'themeInspirationPrompt',
  input: {schema: ThemeInspirationInputSchema},
  output: {schema: ThemeInspirationOutputSchema},
  prompt: `You are a wedding planning expert. Provide inspirational wedding theme ideas based on the user's preferences.

  Theme: {{{theme}}}
  Style: {{{style}}}
  Budget: {{{budget}}}

  Provide detailed suggestions for decorations, venues, and music, formatted as a JSON array. Limit the array to a single element unless instructed otherwise.
  `,
});

const themeInspirationFlow = ai.defineFlow(
  {
    name: 'themeInspirationFlow',
    inputSchema: ThemeInspirationInputSchema,
    outputSchema: ThemeInspirationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
