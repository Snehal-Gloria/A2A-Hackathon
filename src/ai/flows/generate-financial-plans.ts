'use server';

/**
 * @fileOverview Generates personalized financial plans based on user goals.
 *
 * - generateFinancialPlans - A function that generates personalized financial plans.
 * - GenerateFinancialPlansInput - The input type for the generateFinancialPlans function.
 * - GenerateFinancialPlansOutput - The return type for the generateFinancialPlans function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFinancialPlansInputSchema = z.object({
  goal: z.string().describe('The financial goal to achieve (e.g., saving for a vacation, buying a car).'),
  currentSavings: z.number().describe('The current amount of savings.'),
  monthlyIncome: z.number().describe('The user monthly income'),
  monthlyExpenses: z.number().describe('The user monthly expenses'),
});
export type GenerateFinancialPlansInput = z.infer<typeof GenerateFinancialPlansInputSchema>;

const GenerateFinancialPlansOutputSchema = z.object({
  plan: z.string().describe('A detailed financial plan to achieve the specified goal.'),
});
export type GenerateFinancialPlansOutput = z.infer<typeof GenerateFinancialPlansOutputSchema>;

export async function generateFinancialPlans(input: GenerateFinancialPlansInput): Promise<GenerateFinancialPlansOutput> {
  return generateFinancialPlansFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialPlansPrompt',
  input: {schema: GenerateFinancialPlansInputSchema},
  output: {schema: GenerateFinancialPlansOutputSchema},
  prompt: `You are a personal finance advisor. You will generate a personalized financial plan to achieve the user's goal.

  Consider the user's current savings, monthly income, and monthly expenses to make appropriate recommendations.

  Goal: {{{goal}}}
  Current Savings: {{{currentSavings}}}
  Monthly Income: {{{monthlyIncome}}}
  Monthly Expenses: {{{monthlyExpenses}}}

  Provide a clear and actionable plan with specific steps and recommendations.
  `,
});

const generateFinancialPlansFlow = ai.defineFlow(
  {
    name: 'generateFinancialPlansFlow',
    inputSchema: GenerateFinancialPlansInputSchema,
    outputSchema: GenerateFinancialPlansOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
