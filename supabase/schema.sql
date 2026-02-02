-- ============================================
-- FINANCE APP - SUPABASE SCHEMA (OPTIMIZED)
-- ============================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ACCOUNT TYPE ENUM
-- ============================================
DO $$ BEGIN
    CREATE TYPE account_type AS ENUM ('BANK', 'CREDIT', 'INVESTMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- CONNECTION STATUS ENUM
-- ============================================
DO $$ BEGIN
    CREATE TYPE connection_status AS ENUM ('PENDING', 'UPDATING', 'UPDATED', 'ERROR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TRANSACTION TYPE ENUM
-- ============================================
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('DEBIT', 'CREDIT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- NOTE: id must match auth.uid() from Supabase Auth
-- Do not auto-generate - insert auth.uid() on user creation
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY, -- Must be set to auth.uid() on insert
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CONNECTIONS TABLE (Pluggy Items)
-- ============================================
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pluggy_item_id TEXT UNIQUE NOT NULL,
    connector_name TEXT,
    status connection_status DEFAULT 'PENDING',
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_connections_user_id ON public.connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_pluggy_item_id ON public.connections(pluggy_item_id);

-- ============================================
-- 3. ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
    pluggy_account_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type account_type NOT NULL, -- BANK, CREDIT, INVESTMENT
    balance DECIMAL(15, 2) DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_connection_id ON public.accounts(connection_id);

-- ============================================
-- 4. CATEGORIES TABLE (Pluggy ID as Primary Key)
-- ============================================
-- Uses Pluggy category ID as TEXT primary key
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY, -- Pluggy category ID (e.g., '01', '02', etc.)
    description TEXT NOT NULL,
    description_translated TEXT,
    parent_id TEXT REFERENCES public.categories(id),
    icon TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- ============================================
-- 5. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    pluggy_transaction_id TEXT UNIQUE NOT NULL, -- UPSERT key
    date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    type transaction_type, -- DEBIT, CREDIT
    category_id TEXT, -- No references constraint to allow all Pluggy category IDs directly
    merchant_name TEXT,
    payment_data JSONB,
    ai_friendly_description TEXT,
    ai_intent_label TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_pluggy_id ON public.transactions(pluggy_transaction_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users: only see own record
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Connections: only see own connections
CREATE POLICY "Users can view own connections" ON public.connections
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own connections" ON public.connections
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own connections" ON public.connections
    FOR DELETE USING (user_id = auth.uid());

-- Accounts: through connection ownership
CREATE POLICY "Users can view own accounts" ON public.accounts
    FOR SELECT USING (
        connection_id IN (
            SELECT id FROM public.connections WHERE user_id = auth.uid()
        )
    );

-- Categories: public read (shared across users)
CREATE POLICY "Categories are publicly readable" ON public.categories
    FOR SELECT USING (true);

-- Transactions: through account ownership
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (
        account_id IN (
            SELECT a.id FROM public.accounts a
            JOIN public.connections c ON a.connection_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (
        account_id IN (
            SELECT a.id FROM public.accounts a
            JOIN public.connections c ON a.connection_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- ============================================
-- SERVICE ROLE BYPASS (for Edge Functions)
-- ============================================
-- Edge Functions use service_role which bypasses RLS by default

-- ============================================
-- SEED DEFAULT CATEGORIES (Pluggy Standard)
-- ============================================
-- id is now the Pluggy category ID directly
INSERT INTO public.categories (id, description, description_translated, icon, color) VALUES
    ('01', 'Restaurants', 'Alimentação', 'restaurant', '#FF6B6B'),
    ('02', 'Transportation', 'Transporte', 'car', '#4ECDC4'),
    ('03', 'Health', 'Saúde', 'medical', '#45B7D1'),
    ('04', 'Education', 'Educação', 'school', '#96CEB4'),
    ('05', 'Entertainment', 'Entretenimento', 'game-controller', '#DDA0DD'),
    ('06', 'Bills & Utilities', 'Contas', 'receipt', '#FFD93D'),
    ('07', 'Shopping', 'Compras', 'cart', '#6BCB77'),
    ('08', 'Travel', 'Viagem', 'airplane', '#4D96FF'),
    ('09', 'Housing', 'Moradia', 'home', '#FF8B94'),
    ('10', 'Salary', 'Salário', 'wallet', '#A8E6CF'),
    ('11', 'Investments', 'Investimentos', 'trending-up', '#88D8B0'),
    ('12', 'Transfers', 'Transferências', 'swap-horizontal', '#B4A7D6'),
    ('99', 'Others', 'Outros', 'ellipsis-horizontal', '#9E9E9E')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON public.connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
