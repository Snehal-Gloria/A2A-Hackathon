'use server';

/**
 * @fileOverview A flow that generates personalized financial and lifestyle recommendations to reduce environmental impact.
 *
 * - generateFinancialRecommendations - A function that generates financial recommendations.
 * - GenerateFinancialRecommendationsInput - The input type for the generateFinancialRecommendations function.
 * - GenerateFinancialRecommendationsOutput - The return type for the generateFinancialRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFinancialRecommendationsInputSchema = z.object({
  income: z.number().describe('The user\'s monthly income.'),
  expenses: z.number().describe('The user\'s monthly expenses.'),
  carbonFootprint: z.number().describe('The user\'s current carbon footprint.'),
  location: z.string().describe('The user\'s current location.'),
  spendingData: z.string().describe('A description of the user\'s spending habits.'),
});
export type GenerateFinancialRecommendationsInput = z.infer<typeof GenerateFinancialRecommendationsInputSchema>;

const GenerateFinancialRecommendationsOutputSchema = z.object({
  financialRecommendations: z.string().describe('Personalized recommendations for financial decisions.'),
  lifestyleAdjustments: z.string().describe('Personalized recommendations for lifestyle adjustments to reduce environmental impact.'),
});
export type GenerateFinancialRecommendationsOutput = z.infer<typeof GenerateFinancialRecommendationsOutputSchema>;

export async function generateFinancialRecommendations(input: GenerateFinancialRecommendationsInput): Promise<GenerateFinancialRecommendationsOutput> {
  return generateFinancialRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialRecommendationsPrompt',
  input: {schema: GenerateFinancialRecommendationsInputSchema},
  output: {schema: GenerateFinancialRecommendationsOutputSchema},
  prompt: `You are an AI assistant that provides personalized financial and lifestyle recommendations to reduce environmental impact.

  Based on the user's income, expenses, carbon footprint, location, and spending data, provide recommendations for financial decisions and lifestyle adjustments.

  Income: {{{income}}}
  Expenses: {{{expenses}}}
  Carbon Footprint: {{{carbonFootprint}}}
  Location: {{{location}}}
  Spending Data: {{{spendingData}}}

  Provide clear and actionable recommendations in the output.
  `,
});

const generateFinancialRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateFinancialRecommendationsFlow',
    inputSchema: GenerateFinancialRecommendationsInputSchema,
    outputSchema: GenerateFinancialRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
