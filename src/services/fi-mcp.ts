
'use server';
/**
 * @fileOverview Service for interacting with the Fi MCP (Model Context Protocol).
 * This service handles authentication and data fetching from the Fi MCP stream.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { cookies } from 'next/headers';
import {createMcpRemote, McpRemote} from 'mcp-remote';

const COOKIE_NAME = 'fi-mcp-session';

let mcpRemote: McpRemote | null = null;
const getMcpRemote = () => {
  if (mcpRemote) {
    return mcpRemote;
  }
  const url = process.env.MCP_URL || 'http://localhost:8080/mcp/stream';
  console.log(`Connecting to MCP server at: ${url}`);
  mcpRemote = createMcpRemote(url);
  return mcpRemote;
}

// In a real app, you'd use a secure way to store secrets.
// For this prototype, we'll store the session token in a cookie.
// This is NOT secure for production.
const setSessionToken = (token: string) => {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 60, // 30 minutes, as per Fi MCP docs
    path: '/',
  });
};

const getSessionToken = (): string | undefined => {
  return cookies().get(COOKIE_NAME)?.value;
};

const callMcpTool = async (toolName: string, params: any) => {
    let sessionId = getSessionToken();
    if (!sessionId) {
      sessionId = `mcp-session-${crypto.randomUUID()}`;
      setSessionToken(sessionId);
    }
  
    const mcp = getMcpRemote();
    const response = await mcp.call(toolName, params, {sessionId});
  
    if (response?.status === 'login_required') {
      return `Login is required to access this information. Please open this URL to log in: ${response.login_url}`;
    }
  
    if (response?.error) {
      throw new Error(`Fi MCP Error: ${response.error}`);
    }
  
    return response;
  };

  export const authenticate = ai.defineTool(
    {
      name: 'authenticate',
      description: 'Authenticates the user with the Fi-MCP service using a passcode. This is not the primary way to log in. The user should be directed to the login URL provided when a tool call fails with a login_required error.',
      inputSchema: z.object({ passcode: z.string().describe('The Fi-MCP passcode that the user provides.') }),
      outputSchema: z.boolean(),
    },
    async ({ passcode }) => {
      // The local fi-mcp-dev server uses the passcode as the session token (phone number)
      // for simplicity. In a real scenario, this would involve a more complex
      // authentication flow where the passcode is exchanged for a session token.
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
        // A simple check to see if a session token exists.
        // In a real app, you might also want to validate the token with the MCP server.
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
