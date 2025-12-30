
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  type?: 'expense' | 'income';
  source?: string; // e.g. "Bank Statement", "Manual"
  method?: string; // e.g. "Card", "Transfer"
  isDemo?: boolean;
  debugError?: string;
}

export interface LifeObjective {
  id: string;
  title: string;
  estimatedCost: number;
}

export enum AppView {
  LANDING = 'LANDING',
  UPLOAD = 'UPLOAD',
  REVIEW_DATA = 'REVIEW_DATA',
  DASHBOARD = 'DASHBOARD',
  PRICING = 'PRICING',
  ABOUT = 'ABOUT',
}

export interface ExpenseSummary {
  category: string;
  total: number;
  percentage: number;
}
