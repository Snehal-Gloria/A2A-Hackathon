import { config } from 'dotenv';
config();

import '@/ai/flows/generate-financial-recommendations.ts';
import '@/ai/flows/generate-financial-plans.ts';
import '@/ai/flows/financial-assistant-flow.ts';
import '@/services/fi-mcp.ts';
