-- Add an idempotent credit ledger for payment top-ups and future adjustments.

CREATE TABLE IF NOT EXISTS dev.credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('polar_topup', 'image_charge', 'manual_adjustment', 'refund', 'signup_bonus')),
    source_id TEXT NOT NULL,
    delta INTEGER NOT NULL CHECK (delta <> 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source, source_id)
);

CREATE INDEX IF NOT EXISTS credit_ledger_user_id_created_at_idx
    ON dev.credit_ledger (user_id, created_at DESC);

ALTER TABLE dev.credit_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON dev.credit_ledger;
CREATE POLICY "service_role_all" ON dev.credit_ledger
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP FUNCTION IF EXISTS dev.record_credit_ledger_entry(UUID, TEXT, TEXT, INTEGER, TEXT, JSONB, INTEGER);
CREATE FUNCTION dev.record_credit_ledger_entry(
    p_user_id UUID,
    p_source TEXT,
    p_source_id TEXT,
    p_delta INTEGER,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_initial_credits INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_balance INTEGER;
    v_next_balance INTEGER;
    v_existing dev.credit_ledger%ROWTYPE;
    v_ledger_id UUID;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'USER_ID_REQUIRED';
    END IF;

    IF COALESCE(BTRIM(p_source), '') = '' THEN
        RAISE EXCEPTION 'LEDGER_SOURCE_REQUIRED';
    END IF;

    IF COALESCE(BTRIM(p_source_id), '') = '' THEN
        RAISE EXCEPTION 'LEDGER_SOURCE_ID_REQUIRED';
    END IF;

    IF COALESCE(p_delta, 0) = 0 THEN
        RAISE EXCEPTION 'LEDGER_DELTA_REQUIRED';
    END IF;

    PERFORM dev.ensure_user_credits(p_user_id, GREATEST(COALESCE(p_initial_credits, 0), 0));

    SELECT balance
    INTO v_balance
    FROM dev.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'CREDIT_ACCOUNT_NOT_FOUND';
    END IF;

    SELECT *
    INTO v_existing
    FROM dev.credit_ledger
    WHERE source = p_source
      AND source_id = p_source_id
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'applied', false,
            'ledger_id', v_existing.id,
            'balance', v_balance,
            'balance_after', v_existing.balance_after,
            'delta', v_existing.delta
        );
    END IF;

    v_next_balance := v_balance + p_delta;

    IF v_next_balance < 0 THEN
        RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
    END IF;

    UPDATE dev.user_credits
    SET balance = v_next_balance
    WHERE user_id = p_user_id;

    INSERT INTO dev.credit_ledger (
        user_id,
        source,
        source_id,
        delta,
        balance_after,
        description,
        metadata
    )
    VALUES (
        p_user_id,
        p_source,
        p_source_id,
        p_delta,
        v_next_balance,
        p_description,
        COALESCE(p_metadata, '{}'::jsonb)
    )
    RETURNING id INTO v_ledger_id;

    RETURN jsonb_build_object(
        'applied', true,
        'ledger_id', v_ledger_id,
        'balance', v_next_balance,
        'balance_after', v_next_balance,
        'delta', p_delta
    );
END;
$$;

CREATE TABLE IF NOT EXISTS public.credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('polar_topup', 'image_charge', 'manual_adjustment', 'refund', 'signup_bonus')),
    source_id TEXT NOT NULL,
    delta INTEGER NOT NULL CHECK (delta <> 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source, source_id)
);

CREATE INDEX IF NOT EXISTS public_credit_ledger_user_id_created_at_idx
    ON public.credit_ledger (user_id, created_at DESC);

ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.credit_ledger;
CREATE POLICY "service_role_all" ON public.credit_ledger
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP FUNCTION IF EXISTS public.record_credit_ledger_entry(UUID, TEXT, TEXT, INTEGER, TEXT, JSONB, INTEGER);
CREATE FUNCTION public.record_credit_ledger_entry(
    p_user_id UUID,
    p_source TEXT,
    p_source_id TEXT,
    p_delta INTEGER,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_initial_credits INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_balance INTEGER;
    v_next_balance INTEGER;
    v_existing public.credit_ledger%ROWTYPE;
    v_ledger_id UUID;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'USER_ID_REQUIRED';
    END IF;

    IF COALESCE(BTRIM(p_source), '') = '' THEN
        RAISE EXCEPTION 'LEDGER_SOURCE_REQUIRED';
    END IF;

    IF COALESCE(BTRIM(p_source_id), '') = '' THEN
        RAISE EXCEPTION 'LEDGER_SOURCE_ID_REQUIRED';
    END IF;

    IF COALESCE(p_delta, 0) = 0 THEN
        RAISE EXCEPTION 'LEDGER_DELTA_REQUIRED';
    END IF;

    PERFORM public.ensure_user_credits(p_user_id, GREATEST(COALESCE(p_initial_credits, 0), 0));

    SELECT balance
    INTO v_balance
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'CREDIT_ACCOUNT_NOT_FOUND';
    END IF;

    SELECT *
    INTO v_existing
    FROM public.credit_ledger
    WHERE source = p_source
      AND source_id = p_source_id
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'applied', false,
            'ledger_id', v_existing.id,
            'balance', v_balance,
            'balance_after', v_existing.balance_after,
            'delta', v_existing.delta
        );
    END IF;

    v_next_balance := v_balance + p_delta;

    IF v_next_balance < 0 THEN
        RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
    END IF;

    UPDATE public.user_credits
    SET balance = v_next_balance
    WHERE user_id = p_user_id;

    INSERT INTO public.credit_ledger (
        user_id,
        source,
        source_id,
        delta,
        balance_after,
        description,
        metadata
    )
    VALUES (
        p_user_id,
        p_source,
        p_source_id,
        p_delta,
        v_next_balance,
        p_description,
        COALESCE(p_metadata, '{}'::jsonb)
    )
    RETURNING id INTO v_ledger_id;

    RETURN jsonb_build_object(
        'applied', true,
        'ledger_id', v_ledger_id,
        'balance', v_next_balance,
        'balance_after', v_next_balance,
        'delta', p_delta
    );
END;
$$;
