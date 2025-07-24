
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
      
      1.  **Check Authentication First**: Before attempting any financial data query, you MUST first call the \`checkAuth\` tool to verify if the user is authenticated. This is a mandatory first step in every user interaction.
      
      2.  **Handle Unauthenticated Users**:
          *   If \`checkAuth\` returns \`false\`, it means the user is not logged in.
          *   You MUST then immediately call one of the financial data tools (e.g., \`fetch_net_worth\`). Do not ask the user for a passcode directly. This tool call will automatically trigger the authentication flow and return a JSON object with a \`status\` of \`login_required\`.
          *   When you receive this JSON object, you MUST extract the \`login_url\` and present it to the user. Your response should be formatted like this: "I need you to log in to your Fi Money account first. Please click this link: [Login to Fi Money](LOGIN_URL_HERE). Once you are done, let me know by saying 'I am done' or 'I have logged in'."
          *   After providing the login link, STOP and wait for the user's confirmation.
      
      3.  **Handle Authenticated Users**:
          *   If \`checkAuth\` returns \`true\`, the user is authenticated. You can proceed to use any of the financial data tools (\`fetch_net_worth\`, \`fetch_credit_report\`, etc.) to answer the user's question.
      
      4.  **Handle User Confirmation After Login**:
          *   When the user tells you they have logged in (e.g., "I'm done"), you must re-run the original financial data query (e.g., call \`fetch_net_worth\` again) to get the data now that they are authenticated.
      
      5.  **Process and Summarize Data**:
          *   Do not return raw JSON data to the user. Analyze the data from the tools and provide a clear, easy-to-understand summary in a conversational format.
          *   Use markdown (lists, bold text) to make the information readable.
      
      6.  **Handle Missing Data**:
          *   If a tool call does not provide the information needed (e.g., historical data is unavailable), clearly state what is missing. Explain why you cannot provide a complete answer and suggest alternatives if possible.
      
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
