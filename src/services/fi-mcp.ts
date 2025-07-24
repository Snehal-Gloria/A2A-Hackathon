
'use server';
/**
 * @fileOverview Service for interacting with the Fi MCP (Model Context Protocol).
 * This service handles authentication and data fetching from the Fi MCP stream.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'fi-mcp-session';

const setSessionToken = (token: string) => {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 60, // 30 minutes
    path: '/',
  });
};

const getSessionToken = (): string | undefined => {
  return cookies().get(COOKIE_NAME)?.value;
};

const removeSessionToken = () => {
  cookies().delete(COOKIE_NAME);
}

const callMcpTool = async (toolName: string, params: any) => {
  const sessionId = getSessionToken();
  console.log(`Calling tool: ${toolName} with session ID: ${sessionId}`);

  try {
    const response = await fetch('http://localhost:8080/mcp/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId && { 'Mcp-Session-Id': sessionId }),
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params,
        },
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`MCP server error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Request to MCP server failed with status ${response.status}: ${errorText}`);
    }

    const jsonResponse = await response.json();
    
    if (jsonResponse.result && typeof jsonResponse.result.text === 'string') {
        try {
            const parsedText = JSON.parse(jsonResponse.result.text);

            if (parsedText.status === 'login_required') {
                console.log('Login required. Setting new session token.');
                // Clear any invalid session cookie
                removeSessionToken();
                // Extract and set the new session ID provided by the server
                const newSessionId = parsedText.login_url.split('sessionId=')[1];
                if (newSessionId) {
                  setSessionToken(newSessionId);
                }
                // Return the entire login object to the AI. This is crucial.
                return parsedText;
            }
            // If not login_required, this is the actual data.
            return parsedText;
        } catch (e) {
            // If parsing fails, it might be a simple text message.
            console.log('MCP response is not JSON, returning as is:', jsonResponse.result.text);
            return { response: jsonResponse.result.text };
        }
    }
    
    // Return the whole response if it's not in the expected format.
    return jsonResponse;

  } catch (error) {
    console.error('Error calling MCP tool:', error);
    // This could be a network error if the fi-mcp-dev server is not running.
    throw new Error('Failed to connect to the Fi MCP service. Please ensure the `fi-mcp-dev` server is running.');
  }
};

export const authenticate = ai.defineTool(
    {
      name: 'authenticate',
      description: 'Authenticates the user with the Fi-MCP service using a passcode. The passcode is the phone number for the desired test data scenario. This is the primary way to log in.',
      inputSchema: z.object({ passcode: z.string().describe('The Fi-MCP passcode (phone number) that the user provides.') }),
      outputSchema: z.boolean(),
    },
    async ({ passcode }) => {
      // For the fi-mcp-dev server, the "passcode" is the phone number which becomes the session ID.
      // This simulates a successful login by setting the session cookie.
      setSessionToken(passcode);
      return true;
    }
);
  
export const checkAuth = ai.defineTool(
    {
      name: 'checkAuth',
      description: 'Checks if the user is currently authenticated with the Fi-MCP service. This should be the first tool called before any financial data is fetched.',
      inputSchema: z.void(),
      outputSchema: z.boolean(),
    },
    async () => {
      const token = getSessionToken();
      return !!token;
    }
);

export const fetch_net_worth = ai.defineTool(
  {
    name: 'fetch_net_worth',
    description: "Calculate comprehensive net worth using ONLY actual data from accounts users connected on Fi Money including: Bank account balances, Mutual fund investment holdings, Indian Stocks investment holdings, Total US Stocks investment (If investing through Fi Money app), EPF account balances, Credit card debt and loan balances (if credit report connected), Any other assets/liabilities linked to Fi Money platform.",
    inputSchema: z.void(),
    outputSchema: z.any(),
  },
  async () => callMcpTool('fetch_net_worth', {})
);

export const fetch_credit_report = ai.defineTool(
    {
      name: 'fetch_credit_report',
      description: "Retrieve comprehensive credit report including scores, active loans, credit card utilization, payment history, date of birth and recent inquiries from connected credit bureaus.",
      inputSchema: z.void(),
      outputSchema: z.any(),
    },
    async () => callMcpTool('fetch_credit_report', {})
);

export const fetch_epf_details = ai.defineTool(
    {
      name: 'fetch_epf_details',
      description: "Retrieve detailed EPF (Employee Provident Fund) account information including: Account balance and contributions, Employer and employee contribution history, Interest earned and credited amounts.",
      inputSchema: z.void(),
      outputSchema: z.any(),
    },
    async () => callMcpTool('fetch_epf_details', {})
);

export const fetch_mf_transactions = ai.defineTool(
    {
      name: 'fetch_mf_transactions',
      description: "Retrieve detailed transaction history from accounts connected to Fi Money platform including: Mutual fund transactions.",
      inputSchema: z.void(),
      outputSchema: z.any(),
    },
    async () => callMcpTool('fetch_mf_transactions', {})
);

export const fetch_bank_transactions = ai.defineTool(
  {
    name: 'fetch_bank_transactions',
    description: "Retrieve detailed bank transactions for each bank account connected to Fi money platform.",
    inputSchema: z.void(),
    outputSchema: z.any(),
  },
  async () => callMcpTool('fetch_bank_transactions', {})
);

export const fetch_stock_transactions = ai.defineTool(
  {
    name: 'fetch_stock_transactions',
    description: "Retrieve detailed indian stock transactions for all connected indian stock accounts to Fi money platform.",
    inputSchema: z.void(),
    outputSchema: z.any(),
  },
  async () => callMcpTool('fetch_stock_transactions', {})
);
