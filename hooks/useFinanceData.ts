/**
 * Custom hook for fetching financial data from Supabase
 * Falls back to mock data if not authenticated or on error
 */

import { supabase } from '@/lib/supabase';
import { dataApi } from '@/services/api';
import { baseBalance, mockTransactions } from '@/services/mockData';
import { TransactionWithCategory } from '@/types/database.types';
import { FinancialSummary, Period, Transaction } from '@/types/home.types';
import { useCallback, useEffect, useState } from 'react';

interface UseFinanceDataResult {
    summary: FinancialSummary;
    isLoading: boolean;
    isConnected: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Convert database transaction to display format
 */
function convertTransaction(tx: TransactionWithCategory): Transaction {
    return {
        id: tx.id,
        description: tx.ai_friendly_description || tx.description || 'Transação',
        amount: Math.abs(tx.amount),
        date: tx.date,
        type: tx.amount < 0 || tx.type === 'DEBIT' ? 'expense' : 'income',
        category: tx.category?.description_translated || tx.category?.description || 'Outros',
    };
}

/**
 * Filter transactions by period
 */
function filterByPeriod(transactions: Transaction[], period: Period): Transaction[] {
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

    return transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= startDate && txDate <= today;
    });
}

export function useFinanceData(period: Period): UseFinanceDataResult {
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [totalBalance, setTotalBalance] = useState(baseBalance);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Check if user has a session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // No auth - use mock data
                setIsConnected(false);
                setAllTransactions(mockTransactions);
                setTotalBalance(baseBalance);
                return;
            }

            // Try to fetch real data
            const [accountsData, transactionsData] = await Promise.all([
                dataApi.getAccounts(),
                dataApi.getTransactions({ per_page: 100 }),
            ]);

            if (transactionsData.data.length > 0) {
                setIsConnected(true);
                setTotalBalance(accountsData.total_balance);
                setAllTransactions(transactionsData.data.map(convertTransaction));
            } else {
                // No transactions yet - might still be syncing
                setIsConnected(false);
                setAllTransactions(mockTransactions);
                setTotalBalance(baseBalance);
            }
        } catch (err) {
            console.log('Using mock data due to:', err);
            setIsConnected(false);
            setAllTransactions(mockTransactions);
            setTotalBalance(baseBalance);
        } finally {
            setIsLoading(false);
        }
    }, []);

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
        error,
        refetch: fetchData,
    };
}
