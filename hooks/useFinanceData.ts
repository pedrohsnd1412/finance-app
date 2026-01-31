/**
 * Custom hook for fetching financial data from Supabase
 * Queries data directly using authenticated user's ID
 */

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FinancialSummary, Period, Transaction } from '@/types/home.types';
import { useCallback, useEffect, useState } from 'react';

interface UseFinanceDataResult {
    summary: FinancialSummary;
    isLoading: boolean;
    isConnected: boolean;
    hasAccounts: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

interface DbTransaction {
    id: string;
    date: string;
    amount: number;
    description: string;
    type: string;
    category_id: string | null;
    merchant_name: string | null;
}

interface DbAccount {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
}

/**
 * Convert database transaction to display format
 */
function convertTransaction(tx: DbTransaction): Transaction {
    const isExpense = tx.amount < 0 || tx.type === 'DEBIT';
    return {
        id: tx.id,
        description: tx.merchant_name || tx.description || 'Transação',
        amount: Math.abs(tx.amount),
        date: tx.date,
        type: isExpense ? 'expense' : 'income',
        category: 'Outros', // Simplified - categories can be added later
    };
}

/**
 * Filter transactions by period
 */
function filterByPeriod(transactions: Transaction[], period: Period): Transaction[] {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let startDate: Date;
    switch (period) {
        case 'today':
            startDate = new Date(today);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'week':
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'month':
            startDate = new Date(today);
            startDate.setMonth(startDate.getMonth() - 1);
            startDate.setHours(0, 0, 0, 0);
            break;
    }

    return transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= startDate && txDate <= today;
    });
}

export function useFinanceData(period: Period): UseFinanceDataResult {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [hasAccounts, setHasAccounts] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [totalBalance, setTotalBalance] = useState(0);

    const fetchData = useCallback(async () => {
        if (!user) {
            console.log('[useFinanceData] No user, returning empty state');
            setIsLoading(false);
            setIsConnected(false);
            setHasAccounts(false);
            setAllTransactions([]);
            setTotalBalance(0);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Step 1: Fetch user's connections
            const { data: connectionsData, error: connError } = await supabase
                .from('connections')
                .select('id, connector_name, status, user_id, pluggy_item_id')
                .eq('user_id', user.id);

            if (connError) throw connError;

            const connections = (connectionsData as any[]) || [];

            if (connections.length === 0) {
                setIsConnected(false);
                setHasAccounts(false);
                setAllTransactions([]);
                setTotalBalance(0);
                setIsLoading(false);
                return;
            }

            setIsConnected(true);
            const connectionIds = connections.map(c => c.id);

            // Step 2: Fetch accounts for these connections
            const { data: accountsData, error: accError } = await supabase
                .from('accounts')
                .select('id, name, type, balance, currency')
                .in('connection_id', connectionIds);

            if (accError) throw accError;

            const accountList = (accountsData as DbAccount[]) || [];
            setHasAccounts(accountList.length > 0);

            // Calculate total balance
            const balance = accountList.reduce((sum, acc) => {
                if (acc.type === 'CREDIT') {
                    // Credit card balance is usually negative or needs to be subtracted from total
                    return sum - Math.abs(acc.balance);
                }
                return sum + acc.balance;
            }, 0);
            setTotalBalance(balance);

            if (accountList.length === 0) {
                setAllTransactions([]);
                setIsLoading(false);
                return;
            }

            const accountIds = accountList.map(a => a.id);

            // Step 3: Fetch transactions
            const { data: transactionsData, error: txError } = await supabase
                .from('transactions')
                .select('id, date, amount, description, type, category_id, merchant_name')
                .in('account_id', accountIds)
                .order('date', { ascending: false })
                .limit(500);

            if (txError) throw txError;

            const txList = (transactionsData as DbTransaction[]) || [];
            setAllTransactions(txList.map(convertTransaction));

        } catch (err) {
            console.error('[useFinanceData] Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate summary based on period
    const filteredTransactions = filterByPeriod(allTransactions, period);

    const incomeTotal = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenseTotal = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const sortedTransactions = [...filteredTransactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
        summary: {
            totalBalance,
            incomeTotal,
            expenseTotal,
            transactions: sortedTransactions,
        },
        isLoading,
        isConnected,
        hasAccounts,
        error,
        refetch: fetchData,
    };
}
