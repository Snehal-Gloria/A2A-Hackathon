export type Transaction = {
  id: string;
  date: string;
  name: string;
  amount: number;
  category: 'Groceries' | 'Transport' | 'Utilities' | 'Entertainment' | 'Dining' | 'Shopping';
  type: 'income' | 'expense';
  carbon_footprint: number;
};

export type SpendingData = {
  month: string;
  income: number;
  expenses: number;
};

export type CategoryData = {
  category: string;
  value: number;
  fill: string;
};
