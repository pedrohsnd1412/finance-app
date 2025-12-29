/**
 * API Service Layer - Supabase Edge Functions
 */

import { supabase, supabaseUrl } from '@/lib/supabase';
import {
    AccountsSummary,
    Category,
    TransactionsResponse
} from '@/types/database.types';

const FUNCTIONS_URL = `${supabaseUrl}/functions/v1`;

/**
 * Get authorization headers for API calls
 */
async function getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();

    return {
        'Content-Type': 'application/json',
        'Authorization': session ? `Bearer ${session.access_token}` : '',
    };
}

/**
 * Pluggy API
 */
export const pluggyApi = {
    /**
     * Get a connect token to initialize Pluggy Connect widget
     */
    async getConnectToken(userId: string, itemId?: string): Promise<{ accessToken: string; expiresAt: string }> {
        const response = await fetch(`${FUNCTIONS_URL}/pluggy-connect-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, item_id: itemId }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get connect token');
        }

        return response.json();
    },

    /**
     * Save a new connection after Pluggy Connect success
     */
    async saveConnection(itemId: string, connectorName?: string): Promise<void> {
        const headers = await getAuthHeaders();

        const response = await fetch(`${FUNCTIONS_URL}/save-connection`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ item_id: itemId, connector_name: connectorName }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save connection');
        }
    },
};

/**
 * Data API
 */
export const dataApi = {
    /**
     * Get consolidated account balances
     */
    async getAccounts(): Promise<AccountsSummary> {
        const headers = await getAuthHeaders();

        const response = await fetch(`${FUNCTIONS_URL}/get-accounts`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch accounts');
        }

        return response.json();
    },

    /**
     * Get paginated transactions with filters
     */
    async getTransactions(params?: {
        page?: number;
        per_page?: number;
        start_date?: string;
        end_date?: string;
        category_id?: string;
        type?: 'DEBIT' | 'CREDIT';
    }): Promise<TransactionsResponse> {
        const headers = await getAuthHeaders();

        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
        if (params?.start_date) searchParams.set('start_date', params.start_date);
        if (params?.end_date) searchParams.set('end_date', params.end_date);
        if (params?.category_id) searchParams.set('category_id', params.category_id);
        if (params?.type) searchParams.set('type', params.type);

        const url = `${FUNCTIONS_URL}/get-transactions?${searchParams.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch transactions');
        }

        return response.json();
    },

    /**
     * Get all categories
     */
    async getCategories(): Promise<Category[]> {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('description_translated');

        if (error) throw error;
        return data || [];
    },

    /**
     * Update transaction category
     */
    async updateTransactionCategory(transactionId: string, categoryId: string): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('transactions')
            .update({ category_id: categoryId })
            .eq('id', transactionId);

        if (error) throw error;
    },
};
