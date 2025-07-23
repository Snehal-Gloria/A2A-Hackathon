import type { Transaction, SpendingData, CategoryData } from './types';

export const transactionsData: Transaction[] = [
  { id: '1', date: '2024-07-22', name: 'Grocery Store', amount: 75.5, category: 'Groceries', type: 'expense', carbon_footprint: 12.5 },
  { id: '2', date: '2024-07-22', name: 'Gas Station', amount: 45.0, category: 'Transport', type: 'expense', carbon_footprint: 25.2 },
  { id: '3', date: '2024-07-21', name: 'Electricity Bill', amount: 120.0, category: 'Utilities', type: 'expense', carbon_footprint: 50.1 },
  { id: '4', date: '2024-07-20', name: 'Movie Tickets', amount: 30.0, category: 'Entertainment', type: 'expense', carbon_footprint: 5.5 },
  { id: '5', date: '2024-07-19', name: 'Restaurant', amount: 60.0, category: 'Dining', type: 'expense', carbon_footprint: 15.8 },
  { id: '6', date: '2024-07-18', name: 'Clothing Store', amount: 150.0, category: 'Shopping', type: 'expense', carbon_footprint: 20.0 },
  { id: '7', date: '2024-07-15', name: 'Salary', amount: 4000.0, category: 'Groceries', type: 'income', carbon_footprint: 0 },
];

export const spendingData: SpendingData[] = [
  { month: 'Jan', income: 4000, expenses: 2400 },
  { month: 'Feb', income: 3000, expenses: 1398 },
  { month: 'Mar', income: 5000, expenses: 3800 },
  { month: 'Apr', income: 4780, expenses: 3908 },
  { month: 'May', income: 3890, expenses: 4800 },
  { month: 'Jun', income: 4390, expenses: 3800 },
  { month: 'Jul', income: 4490, expenses: 4300 },
];

export const categoryData: CategoryData[] = [
  { category: 'Groceries', value: 400, fill: 'var(--chart-1)' },
  { category: 'Transport', value: 300, fill: 'var(--chart-2)' },
  { category: 'Utilities', value: 250, fill: 'var(--chart-3)' },
  { category: 'Entertainment', value: 200, fill: 'var(--chart-4)' },
  { category: 'Dining', value: 278, fill: 'var(--chart-5)' },
  { category: 'Shopping', value: 189, fill: 'var(--chart-1)' },
];
