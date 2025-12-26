import { FinancialSummary, Period, Transaction } from '@/types/home.types';

/**
 * Mock data simulating Open Finance / Plug AI responses
 */

// Helper to get dates relative to today
const getDateString = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

// All mock transactions
export const mockTransactions: Transaction[] = [
    // Today
    { id: '1', description: 'Café da manhã', amount: 25.90, date: getDateString(0), type: 'expense', category: 'Alimentação' },
    { id: '2', description: 'Pix recebido - João', amount: 150.00, date: getDateString(0), type: 'income', category: 'Transferência' },

    // This week
    { id: '3', description: 'Supermercado', amount: 387.45, date: getDateString(2), type: 'expense', category: 'Alimentação' },
    { id: '4', description: 'Uber', amount: 32.50, date: getDateString(3), type: 'expense', category: 'Transporte' },
    { id: '5', description: 'Freelance - Design', amount: 800.00, date: getDateString(4), type: 'income', category: 'Trabalho' },
    { id: '6', description: 'Farmácia', amount: 89.90, date: getDateString(5), type: 'expense', category: 'Saúde' },

    // This month
    { id: '7', description: 'Salário', amount: 5500.00, date: getDateString(10), type: 'income', category: 'Trabalho' },
    { id: '8', description: 'Aluguel', amount: 1800.00, date: getDateString(12), type: 'expense', category: 'Moradia' },
    { id: '9', description: 'Internet', amount: 119.90, date: getDateString(15), type: 'expense', category: 'Contas' },
    { id: '10', description: 'Energia', amount: 245.30, date: getDateString(16), type: 'expense', category: 'Contas' },
    { id: '11', description: 'Academia', amount: 99.90, date: getDateString(18), type: 'expense', category: 'Saúde' },
    { id: '12', description: 'Cashback cartão', amount: 45.00, date: getDateString(20), type: 'income', category: 'Outros' },
    { id: '13', description: 'Restaurante', amount: 157.80, date: getDateString(22), type: 'expense', category: 'Alimentação' },
    { id: '14', description: 'Streaming', amount: 55.90, date: getDateString(25), type: 'expense', category: 'Entretenimento' },
];

// Base balance (simulating connected bank accounts)
export const baseBalance = 12847.50;

/**
 * Filter transactions by period and calculate summary
 */
export function getFinancialSummary(period: Period): FinancialSummary {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate: Date;

    switch (period) {
        case 'today':
            startDate = today;
            break;
        case 'week':
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 30);
            break;
    }

    const filteredTransactions = mockTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= today;
    });

    const incomeTotal = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenseTotal = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    // Sort by date descending (most recent first)
    const sortedTransactions = [...filteredTransactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
        totalBalance: baseBalance,
        incomeTotal,
        expenseTotal,
        transactions: sortedTransactions,
    };
}

// Legacy exports for backward compatibility
export const MockData = {
    balance: baseBalance,
    recentTransactions: mockTransactions.slice(0, 5).map(t => ({
        id: t.id,
        title: t.description,
        amount: t.amount,
        date: t.date,
        type: t.type === 'income' ? 'credit' : 'debit',
    })),
    cards: [
        { id: '1', brand: 'Visa', last4: '4242', highlight: true },
        { id: '2', brand: 'Mastercard', last4: '1234', highlight: false },
    ],
};
