-- Production-only SQL for profiles and refund_requests.
-- Run this in the Supabase SQL Editor for the production project.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user_credits'
          AND column_name = 'credits'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user_credits'
          AND column_name = 'balance'
    ) THEN
        EXECUTE 'ALTER TABLE public.user_credits RENAME COLUMN credits TO balance';
    ELSIF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user_credits'
          AND column_name = 'credits'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user_credits'
          AND column_name = 'balance'
    ) THEN
        EXECUTE 'UPDATE public.user_credits SET balance = COALESCE(balance, credits)';
        EXECUTE 'ALTER TABLE public.user_credits DROP COLUMN credits';
    END IF;
END
$$;

ALTER TABLE public.user_credits
    ADD COLUMN IF NOT EXISTS balance INTEGER;

UPDATE public.user_credits
SET balance = 0
WHERE balance IS NULL;

CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    user_credits INTEGER NOT NULL DEFAULT 0 CHECK (user_credits >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS user_credits INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

INSERT INTO public.profiles (user_id, email, user_credits)
SELECT
    au.id,
    au.email,
    COALESCE(uc.balance, 0)
FROM auth.users au
LEFT JOIN public.user_credits uc
    ON uc.user_id = au.id
ON CONFLICT (user_id) DO UPDATE
SET
    email = EXCLUDED.email,
    user_credits = EXCLUDED.user_credits;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.profiles;
CREATE POLICY "service_role_all" ON public.profiles
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_read_own_profile" ON public.profiles;
CREATE POLICY "authenticated_read_own_profile" ON public.profiles
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, user_credits)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE((SELECT balance FROM public.user_credits WHERE user_id = NEW.id), 0)
    )
    ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_changed_public_profiles ON auth.users;
CREATE TRIGGER on_auth_user_changed_public_profiles
    AFTER INSERT OR UPDATE OF email ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_profile_from_auth_user();

CREATE OR REPLACE FUNCTION public.sync_profile_from_user_credits()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_balance INTEGER;
BEGIN
    v_user_id := COALESCE(NEW.user_id, OLD.user_id);
    v_balance := CASE
        WHEN TG_OP = 'DELETE' THEN 0
        ELSE COALESCE(NEW.balance, 0)
    END;

    INSERT INTO public.profiles (user_id, email, user_credits)
    VALUES (
        v_user_id,
        (SELECT email FROM auth.users WHERE id = v_user_id),
        GREATEST(v_balance, 0)
    )
    ON CONFLICT (user_id) DO UPDATE
    SET user_credits = EXCLUDED.user_credits;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_public_user_credits_changed_profiles ON public.user_credits;
CREATE TRIGGER on_public_user_credits_changed_profiles
    AFTER INSERT OR UPDATE OF balance OR DELETE ON public.user_credits
    FOR EACH ROW EXECUTE FUNCTION public.sync_profile_from_user_credits();

CREATE TABLE IF NOT EXISTS public.refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_ledger_id UUID REFERENCES public.credit_ledger(id) ON DELETE SET NULL,
    order_id TEXT NOT NULL,
    refund_id TEXT,
    status TEXT NOT NULL DEFAULT 'requested'
        CHECK (status IN ('requested', 'pending', 'completed', 'failed', 'manual_review')),
    reason TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    credits_reversed INTEGER NOT NULL DEFAULT 0 CHECK (credits_reversed >= 0),
    admin_email TEXT,
    comment TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (order_id),
    UNIQUE (refund_id)
);

DROP TRIGGER IF EXISTS refund_requests_updated_at ON public.refund_requests;
CREATE TRIGGER refund_requests_updated_at
    BEFORE UPDATE ON public.refund_requests
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.refund_requests;
CREATE POLICY "service_role_all" ON public.refund_requests
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
