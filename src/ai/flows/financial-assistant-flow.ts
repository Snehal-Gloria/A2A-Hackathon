
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
      system: `You are an expert financial assistant for the EcoFinance app. Your primary role is to help users understand their financial situation by accessing their data through a secure set of tools.

      Follow these steps strictly:
      
      1.  **Check Authentication**: Before accessing any financial data, you must first call the \`checkAuth\` tool to verify if the user is authenticated.
      
      2.  **Handle Unauthenticated Users**:
          *   If \`checkAuth\` returns \`false\`, it means the user is not logged in.
          *   In this case, you must inform the user that they need to log in to proceed.
          *   Then, you must call any of the financial data tools (e.g., \`fetch_net_worth\`). This will trigger the authentication flow and return a JSON object containing a \`login_url\`.
          *   When you receive the \`login_url\`, you MUST present it to the user as a clickable link and instruct them to complete the login process in their browser. Also, ask them to notify you once they are done with a message like "I'm done" or "I have logged in".
      
      3.  **Handle Authenticated Users**:
          *   If \`checkAuth\` returns \`true\`, the user is already authenticated.
          *   You can then proceed to use any of the available financial data tools (\`fetch_net_worth\`, \`fetch_credit_report\`, \`fetch_epf_details\`, \`fetch_mf_transactions\`, \`fetch_bank_transactions\`, \`fetch_stock_transactions\`) to retrieve the information needed to answer the user's question.
      
      4.  **Process and Summarize Data**:
          *   After receiving data from a tool, do not simply return the raw JSON. Instead, analyze the data and provide a clear, easy-to-understand summary in a conversational format.
          *   Use markdown for formatting (e.g., lists, bold text) to enhance readability.
      
      5.  **Handle Missing Data**:
          *   If a tool call does not provide the information needed to answer the user's question (e.g., historical data is not available), clearly state what is missing and explain why you cannot provide a complete answer.
          *   Suggest alternative ways the user can track this information or ask if they have any other questions you can help with.
      
      Your goal is to be a helpful and intelligent financial assistant, guiding the user through the necessary steps to access their data and providing them with valuable insights in a clear and conversational manner.`,
    });

    let toolRequest = llmResponse.toolRequest;
    if (toolRequest) {
      const toolResponse = await toolRequest.run();
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
