
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

const clearSessionToken = () => {
    cookies().delete(COOKIE_NAME);
}

export const authenticate = ai.defineTool(
  {
    name: 'authenticateFiMcp',
    description: 'Authenticates the user with the Fi-MCP service using a passcode.',
    inputSchema: z.object({ passcode: z.string().describe('The Fi-MCP passcode') }),
    outputSchema: z.boolean(),
  },
  async ({ passcode }) => {
    // This is a simplified simulation of the npx command interaction.
    // A production implementation would need a more robust way to handle this CLI interaction.
    return new Promise((resolve, reject) => {
        // Here we are simply setting the passcode as the session token for prototype purposes.
        // The actual `mcp-remote` likely does a more complex handshake.
        if (passcode && passcode.length > 4) { // Simple validation
            setSessionToken(passcode);
            resolve(true);
        } else {
            resolve(false);
        }
    });
  }
);


export const checkAuth = ai.defineTool(
    {
      name: 'checkFiMcpAuth',
      description: 'Checks if the user is currently authenticated with the Fi-MCP service.',
      inputSchema: z.void(),
      outputSchema: z.boolean(),
    },
    async () => {
      const token = getSessionToken();
      return !!token;
    }
);
  

export const getFinancialContext = ai.defineTool(
    {
      name: 'getFinancialContext',
      description: 'Retrieves the user\'s real-time financial context to answer their specific question. Use this tool for any questions about the user\'s finances, net worth, transactions, investments, or credit score.',
      inputSchema: z.object({
        query: z.string().describe('The user\'s question about their finances.'),
      }),
      outputSchema: z.string().describe('The financial context retrieved from Fi-MCP.'),
    },
    async ({ query }) => {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Not authenticated with Fi-MCP. Please provide a passcode.');
      }
      
      // In a real implementation, you would use the token to establish a connection
      // with `mcp-remote` and stream data.
      // For this prototype, since we can't maintain a persistent `mcp-remote` process
      // easily in a serverless function, we will return a simulated response.
      // This simulates what the mcp-remote process might return as context for the LLM.
      
      console.log(`Simulating call to Fi-MCP with query: "${query}"`);
  
      // Simulate different responses based on the query
      if (query.toLowerCase().includes('net worth')) {
        return `
        - Net Worth: ₹1,250,000 (as of today)
        - Change (6 mo): +₹150,000 (+13.6%)
        - Breakdown:
          - Assets: ₹1,500,000 (Stocks, MFs, Cash)
          - Liabilities: ₹250,000 (Credit Card, Personal Loan)
        `;
      } else if (query.toLowerCase().includes('worst performer') || query.toLowerCase().includes('underperforming')) {
        return `
        - Worst Performing Fund (YTD): Parag Parikh Flexi Cap Fund
        - Current Value: ₹85,000
        - YTD Return: -2.5%
        - Suggestion: This fund has a high expense ratio (1.8%). Consider switching to a lower-cost index fund.
        `;
      } else if (query.toLowerCase().includes('credit score')) {
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
  
      // Default simulated context for a generic query
      return `
      - Total Monthly Income: ₹75,000
      - Total Monthly Expenses: ₹62,000
        - Top Categories: Rent (₹25,000), Dining (₹12,000), Shopping (₹8,000)
      - Savings Rate: 17.3%
      - Idle Cash in Savings Account: ₹55,000
      - Recent High-Value Transactions:
        - Amazon.in: ₹15,000 (Electronics)
        - Indigo: ₹8,000 (Flights)
      `;
    }
);
