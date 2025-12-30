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
        console.log('[useFinanceData] ===== STARTING DATA FETCH =====');
        console.log('[useFinanceData] User ID:', user.id);
        console.log('[useFinanceData] User Email:', user.email);

        try {
            // Verify session is valid
            const { data: sessionData } = await supabase.auth.getSession();
            console.log('[useFinanceData] Session valid:', !!sessionData.session);
            console.log('[useFinanceData] Session user ID:', sessionData.session?.user?.id);

            // Step 1: Fetch user's connections (without RLS filter to debug)
            const { data: connections, error: connError } = await supabase
                .from('connections')
                .select('id, connector_name, status, user_id, pluggy_item_id')
                .eq('user_id', user.id);

            console.log('[useFinanceData] Connections query for user_id:', user.id);
            console.log('[useFinanceData] Connections found:', connections?.length || 0);
            console.log('[useFinanceData] Connections data:', JSON.stringify(connections, null, 2));
            console.log('[useFinanceData] Connections error:', connError);

            if (connError) throw connError;

            if (!connections || connections.length === 0) {
                console.log('[useFinanceData] No connections found for this user');

                // Debug: Check if there are ANY connections in the database
                const { data: allConns, error: allErr } = await supabase
                    .from('connections')
                    .select('id, user_id, connector_name')
                    .limit(5);
                console.log('[useFinanceData] DEBUG - Sample connections in DB:', allConns);
                console.log('[useFinanceData] DEBUG - Sample connections error:', allErr);

                setIsConnected(false);
                setHasAccounts(false);
                setAllTransactions([]);
                setTotalBalance(0);
                setIsLoading(false);
                return;
            }

            setIsConnected(true);
            const connectionIds = connections.map(c => c.id);
            console.log('[useFinanceData] Connection IDs:', connectionIds);

            // Step 2: Fetch accounts for these connections
            const { data: accounts, error: accError } = await supabase
                .from('accounts')
                .select('id, name, type, balance, currency')
                .in('connection_id', connectionIds);

            console.log('[useFinanceData] Accounts:', accounts, 'Error:', accError);

            if (accError) throw accError;

            const accountList = (accounts as DbAccount[]) || [];
            setHasAccounts(accountList.length > 0);

            // Calculate total balance
            const balance = accountList.reduce((sum, acc) => {
                if (acc.type === 'CREDIT') {
                    return sum - Math.abs(acc.balance);
                }
                return sum + acc.balance;
            }, 0);
            setTotalBalance(balance);
            console.log('[useFinanceData] Total balance:', balance);

            if (accountList.length === 0) {
                console.log('[useFinanceData] No accounts found');
                setAllTransactions([]);
                setIsLoading(false);
                return;
            }

            const accountIds = accountList.map(a => a.id);
            console.log('[useFinanceData] Account IDs:', accountIds);

            // Step 3: Fetch transactions (simplified - no join)
            const { data: transactions, error: txError } = await supabase
                .from('transactions')
                .select('id, date, amount, description, type, category_id, merchant_name')
                .in('account_id', accountIds)
                .order('date', { ascending: false })
                .limit(500);

            console.log('[useFinanceData] Transactions count:', transactions?.length, 'Error:', txError);

            if (txError) throw txError;

            const txList = (transactions as DbTransaction[]) || [];
            console.log('[useFinanceData] First 3 transactions:', txList.slice(0, 3));

            setAllTransactions(txList.map(convertTransaction));

        } catch (err) {
            console.error('[useFinanceData] Error:', err);
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
