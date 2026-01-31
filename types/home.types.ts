export type Period = 'today' | 'week' | 'month';

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'credit' | 'debit';

export type TransactionTypeFilter = 'all' | 'credit' | 'debit';

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string; // ISO date string
    type: TransactionType;
    paymentMethod: PaymentMethod;
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

export interface TypeFilterOption {
    key: TransactionTypeFilter;
    label: string;
}

export const TYPE_FILTER_OPTIONS: TypeFilterOption[] = [
    { key: 'credit', label: 'Cartão' },
    { key: 'debit', label: 'Débito' },
    { key: 'all', label: 'Todos' },
];
