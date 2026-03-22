-- Add authenticated job ownership and per-user credits.
-- Credits are created lazily and deducted atomically when a job is created.

ALTER TABLE dev.jobs
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS jobs_user_id_created_at_idx
    ON dev.jobs (user_id, created_at DESC);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'jobs'
    ) THEN
        ALTER TABLE public.jobs
            ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

        CREATE INDEX IF NOT EXISTS public_jobs_user_id_created_at_idx
            ON public.jobs (user_id, created_at DESC);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS dev.user_credits (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE dev.user_credits
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'dev'
          AND table_name = 'user_credits'
          AND column_name = 'credits'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'dev'
          AND table_name = 'user_credits'
          AND column_name = 'balance'
    ) THEN
        EXECUTE 'ALTER TABLE dev.user_credits RENAME COLUMN credits TO balance';
    ELSIF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'dev'
          AND table_name = 'user_credits'
          AND column_name = 'credits'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'dev'
          AND table_name = 'user_credits'
          AND column_name = 'balance'
    ) THEN
        EXECUTE 'UPDATE dev.user_credits SET balance = COALESCE(balance, credits)';
        EXECUTE 'ALTER TABLE dev.user_credits DROP COLUMN credits';
    END IF;
END
$$;

ALTER TABLE dev.user_credits
    ADD COLUMN IF NOT EXISTS balance INTEGER;

UPDATE dev.user_credits
SET balance = 0
WHERE balance IS NULL;

ALTER TABLE dev.user_credits
    ALTER COLUMN balance SET DEFAULT 0,
    ALTER COLUMN balance SET NOT NULL,
    DROP CONSTRAINT IF EXISTS user_credits_credits_check,
    DROP CONSTRAINT IF EXISTS user_credits_balance_check,
    DROP CONSTRAINT IF EXISTS user_credits_balance_nonnegative;

ALTER TABLE dev.user_credits
    ADD CONSTRAINT user_credits_balance_nonnegative CHECK (balance >= 0);

DROP TRIGGER IF EXISTS user_credits_updated_at ON dev.user_credits;
CREATE TRIGGER user_credits_updated_at
    BEFORE UPDATE ON dev.user_credits
    FOR EACH ROW EXECUTE FUNCTION dev.set_updated_at();

ALTER TABLE dev.user_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON dev.user_credits;
CREATE POLICY "service_role_all" ON dev.user_credits
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_read_own_credits" ON dev.user_credits;

DROP TRIGGER IF EXISTS on_auth_user_created_dev_user_credits ON auth.users;
DROP FUNCTION IF EXISTS dev.handle_new_auth_user_credits();

DROP FUNCTION IF EXISTS dev.ensure_user_credits(UUID, INTEGER);
CREATE FUNCTION dev.ensure_user_credits(
    p_user_id UUID,
    p_initial_credits INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'USER_ID_REQUIRED';
    END IF;

    INSERT INTO dev.user_credits (user_id, balance)
    VALUES (p_user_id, GREATEST(COALESCE(p_initial_credits, 0), 0))
    ON CONFLICT (user_id) DO NOTHING;

    SELECT balance
    INTO v_balance
    FROM dev.user_credits
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object('balance', v_balance);
END;
$$;

DROP FUNCTION IF EXISTS dev.create_credit_charged_job(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER);
CREATE FUNCTION dev.create_credit_charged_job(
    p_user_id UUID,
    p_filename TEXT,
    p_object_key TEXT,
    p_mode TEXT,
    p_prompt TEXT,
    p_type TEXT DEFAULT 'image',
    p_credit_cost INTEGER DEFAULT 0,
    p_initial_credits INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_balance INTEGER;
    v_job dev.jobs%ROWTYPE;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'USER_ID_REQUIRED';
    END IF;

    IF COALESCE(p_credit_cost, 0) < 0 THEN
        RAISE EXCEPTION 'INVALID_CREDIT_COST';
    END IF;

    INSERT INTO dev.user_credits (user_id, balance)
    VALUES (p_user_id, GREATEST(COALESCE(p_initial_credits, 0), 0))
    ON CONFLICT (user_id) DO NOTHING;

    SELECT balance
    INTO v_balance
    FROM dev.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'CREDIT_ACCOUNT_NOT_FOUND';
    END IF;

    IF v_balance < COALESCE(p_credit_cost, 0) THEN
        RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
    END IF;

    UPDATE dev.user_credits
    SET balance = balance - COALESCE(p_credit_cost, 0)
    WHERE user_id = p_user_id
    RETURNING balance INTO v_balance;

    INSERT INTO dev.jobs (
        user_id,
        filename,
        object_key,
        type,
        mode,
        prompt,
        status
    )
    VALUES (
        p_user_id,
        p_filename,
        COALESCE(p_object_key, ''),
        COALESCE(p_type, 'image'),
        p_mode,
        p_prompt,
        'pending'
    )
    RETURNING * INTO v_job;

    RETURN to_jsonb(v_job)
        || jsonb_build_object(
            'remaining_credits', v_balance,
            'credit_cost', COALESCE(p_credit_cost, 0)
        );
END;
$$;

CREATE TABLE IF NOT EXISTS public.user_credits (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_credits
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

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

ALTER TABLE public.user_credits
    ALTER COLUMN balance SET DEFAULT 0,
    ALTER COLUMN balance SET NOT NULL,
    DROP CONSTRAINT IF EXISTS user_credits_credits_check,
    DROP CONSTRAINT IF EXISTS user_credits_balance_check,
    DROP CONSTRAINT IF EXISTS user_credits_balance_nonnegative;

ALTER TABLE public.user_credits
    ADD CONSTRAINT user_credits_balance_nonnegative CHECK (balance >= 0);

DROP TRIGGER IF EXISTS user_credits_updated_at ON public.user_credits;
CREATE TRIGGER user_credits_updated_at
    BEFORE UPDATE ON public.user_credits
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.user_credits;
CREATE POLICY "service_role_all" ON public.user_credits
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_read_own_credits" ON public.user_credits;

DROP TRIGGER IF EXISTS on_auth_user_created_public_user_credits ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user_credits();

DROP FUNCTION IF EXISTS public.ensure_user_credits(UUID, INTEGER);
CREATE FUNCTION public.ensure_user_credits(
    p_user_id UUID,
    p_initial_credits INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'USER_ID_REQUIRED';
    END IF;

    INSERT INTO public.user_credits (user_id, balance)
    VALUES (p_user_id, GREATEST(COALESCE(p_initial_credits, 0), 0))
    ON CONFLICT (user_id) DO NOTHING;

    SELECT balance
    INTO v_balance
    FROM public.user_credits
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object('balance', v_balance);
END;
$$;

DROP FUNCTION IF EXISTS public.create_credit_charged_job(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER);
CREATE FUNCTION public.create_credit_charged_job(
    p_user_id UUID,
    p_filename TEXT,
    p_object_key TEXT,
    p_mode TEXT,
    p_prompt TEXT,
    p_type TEXT DEFAULT 'image',
    p_credit_cost INTEGER DEFAULT 0,
    p_initial_credits INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_balance INTEGER;
    v_job public.jobs%ROWTYPE;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'USER_ID_REQUIRED';
    END IF;

    IF COALESCE(p_credit_cost, 0) < 0 THEN
        RAISE EXCEPTION 'INVALID_CREDIT_COST';
    END IF;

    INSERT INTO public.user_credits (user_id, balance)
    VALUES (p_user_id, GREATEST(COALESCE(p_initial_credits, 0), 0))
    ON CONFLICT (user_id) DO NOTHING;

    SELECT balance
    INTO v_balance
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'CREDIT_ACCOUNT_NOT_FOUND';
    END IF;

    IF v_balance < COALESCE(p_credit_cost, 0) THEN
        RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
    END IF;

    UPDATE public.user_credits
    SET balance = balance - COALESCE(p_credit_cost, 0)
    WHERE user_id = p_user_id
    RETURNING balance INTO v_balance;

    INSERT INTO public.jobs (
        user_id,
        filename,
        object_key,
        type,
        mode,
        prompt,
        status
    )
    VALUES (
        p_user_id,
        p_filename,
        COALESCE(p_object_key, ''),
        COALESCE(p_type, 'image'),
        p_mode,
        p_prompt,
        'pending'
    )
    RETURNING * INTO v_job;

    RETURN to_jsonb(v_job)
        || jsonb_build_object(
            'remaining_credits', v_balance,
            'credit_cost', COALESCE(p_credit_cost, 0)
        );
END;
$$;
