
'use server';
/**
 * @fileOverview Service for interacting with the Fi MCP (Model Context Protocol).
 * This service handles authentication and data fetching from the Fi MCP stream.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'fi-mcp-session';

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

export const authenticate = ai.defineTool(
  {
    name: 'authenticate',
    description: 'Authenticates the user with the Fi-MCP service using a passcode.',
    inputSchema: z.object({ passcode: z.string().describe('The Fi-MCP passcode') }),
    outputSchema: z.boolean(),
  },
  async ({ passcode }) => {
    // This is a simplified simulation of the npx command interaction.
    // A production implementation would need a more robust way to handle this CLI interaction.
    // Here we are simply setting the passcode as the session token for prototype purposes.
    // The actual `mcp-remote` likely does a more complex handshake.
    if (passcode) {
        setSessionToken(passcode);
        return true;
    }
    return false;
  }
);


export const checkAuth = ai.defineTool(
    {
      name: 'checkAuth',
      description: 'Checks if the user is currently authenticated with the Fi-MCP service.',
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
      description: "Calculate comprehensive net worth using actual data from connected accounts. Provides historical data for the last 6 months.",
      inputSchema: z.void(),
      outputSchema: z.string().describe('A markdown formatted string representing the net worth over the last 6 months.'),
    },
    async () => {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Not authenticated with Fi-MCP. Please provide a passcode.');
      }
      
      // In a real application, this would make a call to the Fi-MCP stream.
      // For this prototype, we return a success message indicating what would happen.
      return "Successfully called fetch_net_worth. In a real app, this would return your net worth data from the Fi-MCP stream.";
    }
);

export const fetch_credit_report = ai.defineTool(
    {
      name: 'fetch_credit_report',
      description: "Retrieve comprehensive credit report information",
      inputSchema: z.void(),
      outputSchema: z.string().describe('A summary of the user\'s credit report.'),
    },
    async () => {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Not authenticated with Fi-MCP. Please provide a passcode.');
      }
      // In a real application, this would make a call to the Fi-MCP stream.
      return "Successfully called fetch_credit_report. In a real app, this would return your credit score and report details.";
    }
);

export const fetch_epf_details = ai.defineTool(
    {
      name: 'fetch_epf_details',
      description: "Access Employee Provident Fund account information",
      inputSchema: z.void(),
      outputSchema: z.string().describe('A summary of the user\'s EPF details.'),
    },
    async () => {
        const token = getSessionToken();
        if (!token) {
          throw new Error('Not authenticated with Fi-MCP. Please provide a passcode.');
        }
        // In a real application, this would make a call to the Fi-MCP stream.
        return "Successfully called fetch_epf_details. In a real app, this would return your EPF account balance and contribution history.";
    }
);

export const fetch_mf_transactions = ai.defineTool(
    {
      name: 'fetch_mf_transactions',
      description: "Retrieve mutual funds transaction history for portfolio analysis",
      inputSchema: z.void(),
      outputSchema: z.string().describe('A summary of recent mutual fund transactions.'),
    },
    async () => {
        const token = getSessionToken();
        if (!token) {
          throw new Error('Not authenticated with Fi-MCP. Please provide a passcode.');
        }
        // In a real application, this would make a call to the Fi-MCP stream.
        return "Successfully called fetch_mf_transactions. In a real app, this would return a list of your mutual fund transactions for analysis.";
    }
);
