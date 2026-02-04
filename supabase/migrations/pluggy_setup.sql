-- ============================================
-- PLUGGY INTEGRATION SCHEMA
-- ============================================

-- 1. ITEMS (Connections)
-- Stores the connection to a financial institution (User <-> Bank)
CREATE TABLE IF NOT EXISTS public.connection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pluggy_item_id TEXT UNIQUE NOT NULL, -- The ID returned by Pluggy
    connector_id TEXT, -- Bank ID (e.g., "1" for Banco do Brasil)
    connector_name TEXT, -- Bank Name
    status TEXT, -- "UPDATED", "LOGIN_ERROR", etc.
    last_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    error_message TEXT
);

-- RLS for connection_items
ALTER TABLE public.connection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connection items" ON public.connection_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connection items" ON public.connection_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connection items" ON public.connection_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connection items" ON public.connection_items
    FOR DELETE USING (auth.uid() = user_id);


-- 2. ACCOUNTS
-- Stores individual accounts (Checking, Savings, Credit Card) linked to an Item
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_item_id UUID NOT NULL REFERENCES public.connection_items(id) ON DELETE CASCADE,
    pluggy_account_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    number TEXT,
    balance NUMERIC,
    currency TEXT DEFAULT 'BRL',
    type TEXT, -- "CHECKING_ACCOUNT", "CREDIT_CARD", etc.
    subtype TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Note: We join with connection_items to check user ownership
CREATE POLICY "Users can view own accounts" ON public.accounts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.connection_items
            WHERE public.connection_items.id = public.accounts.connection_item_id
            AND public.connection_items.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage accounts" ON public.accounts
    FOR ALL USING (auth.role() = 'service_role');


-- 3. TRANSACTIONS
-- Stores transaction history
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    pluggy_transaction_id TEXT UNIQUE NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    category TEXT, -- Pluggy category or mapped category
    status TEXT, -- "POSTED", "PENDING"
    type TEXT, -- "CREDIT", "DEBIT"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.accounts
            JOIN public.connection_items ON public.accounts.connection_item_id = public.connection_items.id
            WHERE public.accounts.id = public.transactions.account_id
            AND public.connection_items.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage transactions" ON public.transactions
    FOR ALL USING (auth.role() = 'service_role');


-- TRIGGERS for updated_at
CREATE TRIGGER update_connection_items_updated_at BEFORE UPDATE ON public.connection_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
