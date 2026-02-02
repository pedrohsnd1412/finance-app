/**
 * Database types matching Supabase schema
 */

export interface Database {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<User, 'id'>>;
            };
        };
    };
}

export interface User {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
}

// Keep placeholders for types that might be referenced but are now empty or simplified
export interface Category {
    id: string;
    description: string;
    description_translated: string | null;
}

export interface Transaction {
    id: string;
    amount: number;
    description: string | null;
}

export interface AccountsSummary {
    total_balance: number;
    accounts: any[];
}

export interface TransactionsResponse {
    data: any[];
    total: number;
    page: number;
    per_page: number;
}
