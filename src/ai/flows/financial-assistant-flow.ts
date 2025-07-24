
'use server';
/**
 * @fileOverview A conversational AI assistant flow that answers financial questions
 * using real-time data from the Fi MCP service.
 */

import { ai } from '@/ai/genkit';
import { authenticate, checkAuth, fetch_credit_report, fetch_epf_details, fetch_mf_transactions, fetch_net_worth, fetch_bank_transactions, fetch_stock_transactions } from '@/services/fi-mcp';
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
      tools: [authenticate, checkAuth, fetch_net_worth, fetch_credit_report, fetch_epf_details, fetch_mf_transactions, fetch_bank_transactions, fetch_stock_transactions],
      system: `You are an expert financial assistant for the EcoFinance app.
        To answer the user's question, you must use the provided tools to access their financial data.
        
        Follow these steps strictly:
        1.  First, ALWAYS call the 'checkAuth' tool to see if the user is authenticated.
        2.  If 'checkAuth' returns 'false', DO NOT call any other tools. Instead, ask the user to provide the passcode from their Fi Money app to authenticate. Once they provide the passcode, call the 'authenticate' tool with the provided passcode.
        3.  If 'checkAuth' returns 'true', you are free to use any of the other financial data tools ('fetch_net_worth', 'fetch_credit_report', 'fetch_epf_details', 'fetch_mf_transactions', 'fetch_bank_transactions', 'fetch_stock_transactions') to get the information needed to answer the user's question.
        4.  If a tool call returns a login URL, present that URL to the user and instruct them to log in. After they confirm they have logged in, you should retry the original tool call.
        5.  Once you have the data from the tools, provide a clear, easy-to-understand answer to the user's question based on that data. Do not just return the raw JSON data. Summarize and explain it.
        6.  If the user asks a question that cannot be answered with the available data, state that you don't have the information and suggest what they can do.
        
        Your responses should be formatted using markdown for better readability (e.g., using lists, bold text).`,
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
