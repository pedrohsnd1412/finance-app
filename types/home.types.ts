/**
 * Types for Home Dashboard - Open Finance compatible
 */

export type Period = 'today' | 'week' | 'month';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string; // ISO date string
    type: TransactionType;
    category?: string;
}

export interface FinancialSummary {
    totalBalance: number;
    incomeTotal: number;
    expenseTotal: number;
    transactions: Transaction[];
}

export interface PeriodOption {
    key: Period;
    label: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
    { key: 'today', label: 'Hoje' },
    { key: 'week', label: '7 dias' },
    { key: 'month', label: 'Mês' },
];
