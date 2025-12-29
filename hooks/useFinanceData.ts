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
    type: 'DEBIT' | 'CREDIT';
    category_id: string | null;
    merchant_name: string | null;
    categories: {
        description: string;
        description_translated: string | null;
    } | null;
}

interface DbAccount {
    id: string;
    name: string;
    type: 'BANK' | 'CREDIT' | 'INVESTMENT';
    balance: number;
    currency: string;
}

/**
 * Convert database transaction to display format
 */
function convertTransaction(tx: DbTransaction): Transaction {
    return {
        id: tx.id,
        description: tx.merchant_name || tx.description || 'Transação',
        amount: Math.abs(tx.amount),
        date: tx.date,
        type: tx.amount < 0 || tx.type === 'DEBIT' ? 'expense' : 'income',
        category: tx.categories?.description_translated || tx.categories?.description || 'Outros',
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
            startDate.setDate(startDate.getDate() - 30);
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
            // Fetch user's connections
            const { data: connections } = await supabase
                .from('connections')
                .select('id')
                .eq('user_id', user.id);

            if (!connections || connections.length === 0) {
                setIsConnected(false);
                setHasAccounts(false);
                setAllTransactions([]);
                setTotalBalance(0);
                setIsLoading(false);
                return;
            }

            const connectionIds = connections.map(c => c.id);

            // Fetch accounts for these connections
            const { data: accounts } = await supabase
                .from('accounts')
                .select('id, name, type, balance, currency')
                .in('connection_id', connectionIds);

            const accountList = (accounts as DbAccount[]) || [];
            setHasAccounts(accountList.length > 0);

            // Calculate total balance (BANK accounts positive, CREDIT negative)
            const balance = accountList.reduce((sum, acc) => {
                if (acc.type === 'CREDIT') {
                    return sum - Math.abs(acc.balance);
                }
                return sum + acc.balance;
            }, 0);
            setTotalBalance(balance);

            if (accountList.length === 0) {
                setIsConnected(true);
                setAllTransactions([]);
                setIsLoading(false);
                return;
            }

            const accountIds = accountList.map(a => a.id);

            // Fetch transactions with categories
            const { data: transactions } = await supabase
                .from('transactions')
                .select(`
                    id,
                    date,
                    amount,
                    description,
                    type,
                    category_id,
                    merchant_name,
                    categories (
                        description,
                        description_translated
                    )
                `)
                .in('account_id', accountIds)
                .order('date', { ascending: false })
                .limit(500);

            const txList = (transactions as DbTransaction[]) || [];
            setIsConnected(true);
            setAllTransactions(txList.map(convertTransaction));

        } catch (err) {
            console.error('Error fetching financial data:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
            setIsConnected(false);
            setHasAccounts(false);
            setAllTransactions([]);
            setTotalBalance(0);
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
