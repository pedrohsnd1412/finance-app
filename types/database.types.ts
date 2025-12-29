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
            connections: {
                Row: Connection;
                Insert: Omit<Connection, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Connection, 'id'>>;
            };
            accounts: {
                Row: Account;
                Insert: Omit<Account, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Account, 'id'>>;
            };
            categories: {
                Row: Category;
                Insert: Omit<Category, 'created_at'>; // id is required (Pluggy category ID)
                Update: Partial<Omit<Category, 'id'>>;
            };
            transactions: {
                Row: Transaction;
                Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Transaction, 'id'>>;
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

export interface Connection {
    id: string;
    user_id: string;
    pluggy_item_id: string;
    connector_name: string | null;
    status: 'PENDING' | 'UPDATING' | 'UPDATED' | 'ERROR';
    last_synced_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Account {
    id: string;
    connection_id: string;
    pluggy_account_id: string;
    name: string;
    type: 'BANK' | 'CREDIT' | 'INVESTMENT'; // Required ENUM
    balance: number;
    currency: string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string; // Pluggy category ID (TEXT, e.g., '01', '02')
    description: string;
    description_translated: string | null;
    parent_id: string | null;
    icon: string | null;
    color: string | null;
    created_at: string;
}

export interface Transaction {
    id: string;
    account_id: string;
    pluggy_transaction_id: string;
    date: string;
    amount: number;
    description: string | null;
    type: 'DEBIT' | 'CREDIT' | null;
    category_id: string | null; // TEXT FK to categories.id
    merchant_name: string | null;
    payment_data: Record<string, unknown> | null;
    ai_friendly_description: string | null;
    ai_intent_label: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

// Extended types with relations
export interface TransactionWithCategory extends Transaction {
    category: Category | null;
}

export interface AccountWithConnection extends Account {
    connection: Connection;
}

// API response types
export interface AccountsSummary {
    total_balance: number;
    accounts: Account[];
}

export interface TransactionsResponse {
    data: TransactionWithCategory[];
    total: number;
    page: number;
    per_page: number;
}
