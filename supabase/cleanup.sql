-- ============================================
-- CLEANUP SCRIPT - REMOVE PLUGGY INTEGRATION
-- ============================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Drop Tables (in order of dependencies)
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- 2. Drop Custom Types
DROP TYPE IF EXISTS public.account_type CASCADE;
DROP TYPE IF EXISTS public.connection_status CASCADE;
DROP TYPE IF EXISTS public.transaction_type CASCADE;

-- 3. Drop Functions/Triggers (if existing)
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
