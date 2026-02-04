import { supabase } from '@/lib/supabase';
import { FinancialSummary, PaymentMethod, Period, TransactionType, TransactionTypeFilter } from '@/types/home.types';
import { useCallback, useEffect, useState } from 'react';

interface UseFinanceDataResult {
    summary: FinancialSummary & { userName: string | null };
    isLoading: boolean;
    isConnected: boolean;
    hasAccounts: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useFinanceData(period: Period, typeFilter: TransactionTypeFilter = 'all', connectionId: string | null = null): UseFinanceDataResult {
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState<FinancialSummary & { userName: string | null }>({
        totalBalance: 0,
        totalDebit: 0,
        totalCredit: 0,
        incomeTotal: 0,
        expenseTotal: 0,
        transactions: [],
        userName: null,
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
            let query = supabase
                .from('transactions')
                .select('*')
                .gte('date', startDate.toISOString())
                .order('date', { ascending: false });

            const { data: transactionsData, error: transactionError } = await query;

            if (transactionError) throw transactionError;

            // Fetch User Profile Name
            const { data: { user } } = await supabase.auth.getUser();
            let userName = null;
            if (user) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', user.id)
                    .single();
                userName = userData?.name || user.email?.split('@')[0] || 'User';
            }

            // Fetch Accounts (for total balance)
            const { data: accountsData, error: accountsError } = await supabase
                .from('accounts')
                .select('balance, type, connection_item_id, id');

            if (accountsError) throw accountsError;

            const transactions = transactionsData || [];
            let accounts = (accountsData || []) as any[];

            // Filter by Connection ID if present
            if (connectionId) {
                accounts = accounts.filter(acc => acc.connection_item_id === connectionId);
            }

            // Calculate Separated Balances
            const creditAccounts = accounts.filter(acc => acc.type === 'CREDIT_CARD');
            const debitAccounts = accounts.filter(acc => acc.type !== 'CREDIT_CARD');

            const totalCredit = creditAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
            const totalDebit = debitAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

            // Net Total Balance
            const totalBalance = totalDebit - totalCredit;

            // Build set of valid account IDs for filtering transactions
            const validAccountIds = connectionId ? new Set(accounts.map(acc => acc.id)) : null;

            // Income/Expense from transactions
            const incomeTotal = transactions
                .filter((t: any) => t.amount > 0 && (!validAccountIds || validAccountIds.has(t.account_id)))
                .reduce((sum: number, t: any) => sum + t.amount, 0);

            const expenseTotal = transactions
                .filter((t: any) => t.amount < 0 && (!validAccountIds || validAccountIds.has(t.account_id)))
                .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

            // Filter by Payment Method (credit/debit) AND Connection
            const filteredTransactions = transactions.filter((t: any) => {
                // Connection Filter
                if (validAccountIds && !validAccountIds.has(t.account_id)) return false;

                // Type Filter
                if (typeFilter === 'all') return true;
                const paymentMethod = (t.type === 'CREDIT' || t.type === 'credit') ? 'credit' : 'debit';
                return paymentMethod === typeFilter;
            });

            // Map to existing UI model
            const mappedTransactions: any[] = filteredTransactions.map((t: any) => ({
                id: t.id,
                description: t.description || 'Sem descrição',
                amount: Math.abs(t.amount),
                date: t.date,
                type: (t.amount < 0 ? 'expense' : 'income') as TransactionType,
                category: t.category,
                // Map DB type to UI PaymentMethod
                paymentMethod: ((t.type === 'CREDIT' || t.type === 'credit') ? 'credit' : 'debit') as PaymentMethod,
            }));

            setSummary({
                totalBalance,
                totalDebit,
                totalCredit,
                incomeTotal,
                expenseTotal,
                transactions: mappedTransactions,
                userName,
            });

        } catch (err: any) {
            console.error("useFinanceData error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [period, typeFilter, connectionId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        summary,
        isLoading,
        isConnected: true,
        hasAccounts: summary.transactions.length > 0 || summary.totalBalance !== 0,
        error,
        refetch: fetchData,
    };
}
