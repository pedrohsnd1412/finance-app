import { FinancialSummary, Period, TransactionTypeFilter } from '@/types/home.types';
import { useCallback, useState } from 'react';

interface UseFinanceDataResult {
    summary: FinancialSummary;
    isLoading: boolean;
    isConnected: boolean;
    hasAccounts: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useFinanceData(period: Period, typeFilter: TransactionTypeFilter = 'all'): UseFinanceDataResult {
    const [isLoading] = useState(false);
    const [isConnected] = useState(false);
    const [hasAccounts] = useState(false);
    const [error] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        // No-op as Pluggy integration is removed
    }, []);

    return {
        summary: {
            totalBalance: 0,
            incomeTotal: 0,
            expenseTotal: 0,
            transactions: [],
        },
        isLoading,
        isConnected,
        hasAccounts,
        error,
        refetch: fetchData,
    };
}
