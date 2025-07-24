
'use server';
/**
 * @fileOverview A conversational AI assistant flow that answers financial questions
 * using real-time data from the Fi MCP service.
 */

import { ai } from '@/ai/genkit';
import { authenticate, checkAuth, fetch_credit_report, fetch_epf_details, fetch_mf_transactions, fetch_net_worth } from '@/services/fi-mcp';
import { z } from 'zod';

const AskFinancialAssistantInputSchema = z.object({
  query: z.string().describe("The user's question about their finances."),
});
export type AskFinancialAssistantInput = z.infer<typeof AskFinancialAssistantInputSchema>;

const AskFinancialAssistantOutputSchema = z.object({
  response: z.string().describe("The AI assistant's answer to the user's question."),
});
export type AskFinancialAssistantOutput = z.infer<typeof AskFinancialAssistantOutputSchema>;

export async function askFinancialAssistant(input: AskFinancialAssistantInput): Promise<AskFinancialAssistantOutput> {
  return financialAssistantFlow(input);
}

const financialAssistantFlow = ai.defineFlow(
  {
    name: 'financialAssistantFlow',
    inputSchema: AskFinancialAssistantInputSchema,
    outputSchema: AskFinancialAssistantOutputSchema,
  },
  async ({ query }) => {
    const llmResponse = await ai.generate({
      prompt: query,
      model: 'googleai/gemini-1.5-flash',
      tools: [authenticate, checkAuth, fetch_net_worth, fetch_credit_report, fetch_epf_details, fetch_mf_transactions],
      system: `You are an expert financial assistant for the EcoFinance app.
        Your role is to provide clear, insightful, and actionable answers to the user's financial questions.
        The user is already authenticated. You can directly use the financial data tools to answer the user's question.
        - Ground your answers in the data provided by the tools. Do not make up information.
        - Be concise and easy to understand. Avoid jargon where possible.
        - If the user asks a question that cannot be answered with the available data, state that you don't have the information and suggest what they can do.
        - Your responses should be formatted using markdown for better readability (e.g., using lists, bold text).`,
    });

    const toolRequest = llmResponse.toolRequest;
    if (toolRequest) {
      const toolResponse = await toolRequest.run();
      // After getting the tool's response, send it back to the LLM to generate a natural language summary.
      const finalResponse = await ai.generate({
        prompt: {
          history: [llmResponse.request.prompt, llmResponse.message, toolResponse],
        },
        model: 'googleai/gemini-1.5-flash',
      });
      return { response: finalResponse.text };
    }


    return { response: llmResponse.text };
  }
);
