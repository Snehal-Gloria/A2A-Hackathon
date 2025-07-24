'use server';
/**
 * @fileOverview A conversational AI assistant flow that answers financial questions
 * using real-time data from the Fi MCP service.
 */

import { ai } from '@/ai/genkit';
import { getFinancialContext } from '@/services/fi-mcp';
import { z } from 'zod';

const AskFinancialAssistantInputSchema = z.object({
  query: z.string().describe("The user's question about their finances."),
});
export type AskFinancialAssistantInput = z.infer<typeof AskFinancialAssistantInputSchema>;

const AskFinancialAssistantOutputSchema = z.object({
  response: z.string().describe("The AI assistant's answer to the user's question."),
});
export type AskFinancialAssistantOutput = z.infer<typeof AskFinancialAssistantOutputSchema>;

// This is the tool that the AI will use to fetch the user's financial data.
const financialContextTool = ai.defineTool(
  {
    name: 'getFinancialContext',
    description: 'Retrieves the user\'s real-time financial context to answer their specific question. Use this tool for any questions about the user\'s finances, net worth, transactions, investments, or credit score.',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.string(),
  },
  async (input) => getFinancialContext(input)
);

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
      model: 'googleai/gemini-2.0-flash',
      tools: [financialContextTool],
      system: `You are an expert financial assistant for the EcoFinance app.
        Your role is to provide clear, insightful, and actionable answers to the user's financial questions.
        - You MUST use the 'getFinancialContext' tool to get the user's real-time financial data before answering any question.
        - Ground your answers in the data provided by the tool. Do not make up information.
        - Be concise and easy to understand. Avoid jargon where possible.
        - If the user asks a question that cannot be answered with the available data, state that you don't have the information and suggest what they can do.
        - Your responses should be formatted using markdown for better readability (e.g., using lists, bold text).`,
    });

    const toolCalls = llmResponse.toolCalls();

    if (toolCalls.length > 0) {
        const toolResponse = await llmResponse.forward(toolCalls);
        const finalResponse = await ai.generate({
            prompt: {
              history: [llmResponse.request.prompt, llmResponse.message, toolResponse],
            },
        });
        return { response: finalResponse.text };
    }


    return { response: llmResponse.text };
  }
);
