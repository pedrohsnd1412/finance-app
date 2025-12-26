import { getFinancialSummary } from '@/services/mockData';
import { FinancialSummary, Period } from '@/types/home.types';
import { useMemo, useState } from 'react';

/**
 * Hook for managing period filter state and filtered financial data
 */
export function usePeriodFilter(initialPeriod: Period = 'month') {
    const [period, setPeriod] = useState<Period>(initialPeriod);

    const summary: FinancialSummary = useMemo(() => {
        return getFinancialSummary(period);
    }, [period]);

    return {
        period,
        setPeriod,
        summary,
    };
}
