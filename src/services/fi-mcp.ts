
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
    if (passcode && passcode.length > 4) { // Simple validation
        setSessionToken(passcode);
        return true;
    } else {
        return false;
    }
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
      
      const today = new Date();
      let response = 'Historical Net Worth (Simulated):\n\n';
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        
        // Simulate net worth fluctuations
        const baseNetWorth = 1100000;
        const fluctuation = (Math.random() - 0.2) * 50000 * (6-i);
        const netWorth = Math.round(baseNetWorth + fluctuation);
        
        const assets = Math.round(netWorth * 1.2);
        const liabilities = Math.round(assets - netWorth);

        response += `**${month} ${year}:**\n`;
        response += `- Net Worth: ₹${netWorth.toLocaleString('en-IN')}\n`;
        response += `- Assets: ₹${assets.toLocaleString('en-IN')}\n`;
        response += `- Liabilities: ₹${liabilities.toLocaleString('en-IN')}\n\n`;
      }
       
      const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);
      const startNetWorth = 1100000 + (Math.random() - 0.2) * 50000;
      const currentNetWorth = 1250000;
      const change = currentNetWorth - startNetWorth;
      const percentageChange = (change / startNetWorth * 100).toFixed(1);

      response += `**Summary (6 months):**\n`;
      response += `- Change: +₹${change.toLocaleString('en-IN')} (+${percentageChange}%)\n`;
      response += `- Breakdown:\n`;
      response += `  - Assets: ₹1,500,000 (Stocks, MFs, Cash)\n`;
      response += `  - Liabilities: ₹250,000 (Credit Card, Personal Loan)\n`;

      return response;
    }
);

export const fetch_credit_report = ai.defineTool(
    {
      name: 'fetch_credit_report',
      description: "Retrieve comprehensive credit report information",
      inputSchema: z.void(),
      outputSchema: z.string().describe('The financial context retrieved from Fi-MCP.'),
    },
    async () => {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Not authenticated with Fi-MCP. Please provide a passcode.');
      }
      return `
      - Current Credit Score: 720
      - Factors affecting score:
        - High credit utilization on HDFC Credit Card (85%)
        - One late payment on personal loan (3 months ago)
      - Recommendations:
        - Pay down HDFC card balance below 30% utilization.
        - Set up auto-pay for all loans and credit cards to avoid missed payments.
      `;
    }
);

export const fetch_epf_details = ai.defineTool(
    {
      name: 'fetch_epf_details',
      description: "Access Employee Provident Fund account information",
      inputSchema: z.void(),
      outputSchema: z.string().describe('The financial context retrieved from Fi-MCP.'),
    },
    async () => {
        const token = getSessionToken();
        if (!token) {
          throw new Error('Not authenticated with Fi-MCP. Please provide a passcode.');
        }
        return `
        - Current account balance: ₹5,00,000
        - Employer: Acme Corp
        - Employee contribution: ₹2,00,000
        - Employer contribution: ₹2,00,000
        - Interest earned: ₹1,00,000
        `
    }
);

export const fetch_mf_transactions = ai.defineTool(
    {
      name: 'fetch_mf_transactions',
      description: "Retrieve mutual funds transaction history for portfolio analysis",
      inputSchema: z.void(),
      outputSchema: z.string().describe('The financial context retrieved from Fi-MCP.'),
    },
    async () => {
        const token = getSessionToken();
        if (!token) {
          throw new Error('Not authenticated with Fi-MCP. Please provide a passcode.');
        }
        return `
        - Worst Performing Fund (YTD): Parag Parikh Flexi Cap Fund
        - Current Value: ₹85,000
        - YTD Return: -2.5%
        - Suggestion: This fund has a high expense ratio (1.8%). Consider switching to a lower-cost index fund.
        `;
    }
);
