import { supabase } from '@/lib/supabase';
import { FinancialSummary, Period, TransactionTypeFilter } from '@/types/home.types';
import { useCallback, useEffect, useState } from 'react';

interface UseFinanceDataResult {
    summary: FinancialSummary;
    isLoading: boolean;
    isConnected: boolean;
    hasAccounts: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useFinanceData(period: Period, typeFilter: TransactionTypeFilter = 'all'): UseFinanceDataResult {
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState<FinancialSummary>({
        totalBalance: 0,
        incomeTotal: 0,
        expenseTotal: 0,
        transactions: [],
    });
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Get date range based on period
            const now = new Date();
            let startDate: Date;

            switch (period) {
                case 'week':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'today':
                default:
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
            }

            // Fetch Transactions
            const queryParams = new URLSearchParams();
            queryParams.append('start_date', startDate.toISOString());
            queryParams.append('per_page', '100');

            const { data: transactionsData, error: transactionError } = await supabase.functions.invoke(
                `get-transactions?${queryParams.toString()}`,
                { method: 'GET' }
            );

            if (transactionError) throw transactionError;

            // Fetch Accounts (for total balance)
            const { data: accountsData, error: accountsError } = await supabase.functions.invoke('get-accounts', { method: 'GET' });
            if (accountsError) throw accountsError;

            const transactions = transactionsData?.data || [];

            // Calculate totals
            const totalBalance = accountsData?.total_balance || 0;

            // Income/Expense from transactions
            const incomeTotal = transactions
                .filter((t: any) => t.amount > 0)
                .reduce((sum: number, t: any) => sum + t.amount, 0);

            const expenseTotal = transactions
                .filter((t: any) => t.amount < 0)
                .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

            // Filter by Payment Method (credit/debit)
            const filteredTransactions = typeFilter === 'all'
                ? transactions
                : transactions.filter((t: any) => {
                    const paymentMethod = t.type === 'CREDIT' ? 'credit' : 'debit';
                    return paymentMethod === typeFilter;
                });

            // Map to existing UI model
            const mappedTransactions = filteredTransactions.map((t: any) => ({
                id: t.id,
                description: t.description || 'Sem descrição',
                amount: Math.abs(t.amount),
                date: t.date,
                type: t.amount < 0 ? 'expense' : 'income',
                category: t.category,
                paymentMethod: t.type === 'CREDIT' ? 'credit' : 'debit',
            }));

            setSummary({
                totalBalance,
                incomeTotal,
                expenseTotal,
                transactions: mappedTransactions,
            });

        } catch (err: any) {
            console.error("useFinanceData error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [period, typeFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        summary,
        isLoading,
        isConnected: true, // TODO: Check actual connection state
        hasAccounts: summary.transactions.length > 0 || summary.totalBalance !== 0,
        error,
        refetch: fetchData,
    };
}
