export interface Transaction {
    id: string;
    title: string;
    amount: number;
    date: string;
    type: 'debit' | 'credit';
}

export const MockData = {
    balance: 12500.50,
    recentTransactions: [
        { id: '1', title: 'Supermercado', amount: 450.00, date: '2023-10-25', type: 'debit' },
        { id: '2', title: 'Salário', amount: 5000.00, date: '2023-10-05', type: 'credit' },
        { id: '3', title: 'Uber', amount: 24.90, date: '2023-10-24', type: 'debit' },
    ] as Transaction[],
    cards: [
        { id: '1', brand: 'Visa', last4: '4242', highlight: true },
        { id: '2', brand: 'Mastercard', last4: '1234', highlight: false },
    ],
};
