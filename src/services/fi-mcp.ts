
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

const callMcpTool = async (toolName: string, params: any) => {
    const sessionId = getSessionToken();
    if (!sessionId) {
      // This will simulate the login_required response.
      const mockSessionId = `mcp-session-${crypto.randomUUID()}`;
      const loginUrl = `http://localhost:8080/mockWebPage?sessionId=${mockSessionId}`;
      return {
        status: 'login_required',
        login_url: loginUrl,
        message: `Needs to login first by going to the login url. Please use phone number ${mockSessionId.substring(0, 10)} to login.`
      };
    }
  
    // Placeholder data for demonstration
    const placeholderData: Record<string, any> = {
        fetch_net_worth: {
            netWorthResponse: {
                totalNetWorthValue: { currencyCode: 'INR', units: '658305' },
                assetValues: [
                    { netWorthAttribute: 'ASSET_TYPE_MUTUAL_FUND', value: { currencyCode: 'INR', units: '84642' } },
                    { netWorthAttribute: 'ASSET_TYPE_EPF', value: { currencyCode: 'INR', units: '211111' } },
                ],
                liabilityValues: [
                    { netWorthAttribute: 'LIABILITY_TYPE_VEHICLE_LOAN', value: { currencyCode: 'INR', units: '5000' } },
                ]
            }
        },
        fetch_credit_report: { creditReports: [{ creditReportData: { score: { bureauScore: "746" } } }] },
        fetch_epf_details: { uanAccounts: [{ rawDetails: { overall_pf_balance: { current_pf_balance: "211111" } } }] },
        fetch_mf_transactions: { mfTransactions: [{ schemeName: "Canara Robeco Gilt Fund - Regular Plan", txns: [[1,"2023-01-01",66.5546,100,6655.46]] }] },
        fetch_bank_transactions: { bankTransactions: [{ bank: 'HDFC Bank', txns: [['80085','UPI-SHEETAL RAVINDRA DA-SHEETAL.DAMBAL@OKSBI','2025-07-09',1,'CARD_PAYMENT','-79109']] }] },
        fetch_stock_transactions: { stockTransactions: [{ isin: 'INE0BWS23018', txns: [[1, '2023-05-04', 100]] }] },
    };
  
    return placeholderData[toolName] || { message: `Successfully called ${toolName}. In a real app, this would return live data.`};
};

export const authenticate = ai.defineTool(
    {
      name: 'authenticate',
      description: 'Authenticates the user with the Fi-MCP service using a passcode. This is the primary way to log in.',
      inputSchema: z.object({ passcode: z.string().describe('The Fi-MCP passcode that the user provides. This is usually a phone number for the dev server.') }),
      outputSchema: z.boolean(),
    },
    async ({ passcode }) => {
      // This simulates a successful login by setting the session cookie.
      // The passcode would be one of the phone numbers from the test data.
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
