-- Add an atomic RPC that records credit usage in credit_ledger when jobs are created.
-- In production, only the public schema is required. The dev schema block is conditional.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.schemata
        WHERE schema_name = 'dev'
    ) THEN
        EXECUTE $fn$
        CREATE OR REPLACE FUNCTION dev.create_credit_charged_job_with_ledger(
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
        AS $body$
        DECLARE
            v_balance INTEGER;
            v_job dev.jobs%ROWTYPE;
            v_credit_cost INTEGER;
        BEGIN
            IF p_user_id IS NULL THEN
                RAISE EXCEPTION 'USER_ID_REQUIRED';
            END IF;

            v_credit_cost := COALESCE(p_credit_cost, 0);

            IF v_credit_cost < 0 THEN
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

            IF v_balance < v_credit_cost THEN
                RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
            END IF;

            UPDATE dev.user_credits
            SET balance = balance - v_credit_cost
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
                'image_charge',
                v_job.id::text,
                -v_credit_cost,
                v_balance,
                CASE
                    WHEN p_mode = 'generate' THEN '이미지 생성: ' || p_filename
                    ELSE '이미지 보정: ' || p_filename
                END,
                jsonb_build_object(
                    'job_id', v_job.id,
                    'filename', p_filename,
                    'object_key', COALESCE(p_object_key, ''),
                    'mode', p_mode,
                    'prompt', p_prompt,
                    'type', COALESCE(p_type, 'image')
                )
            );

            RETURN to_jsonb(v_job)
                || jsonb_build_object(
                    'remaining_credits', v_balance,
                    'credit_cost', v_credit_cost
                );
        END;
        $body$;
        $fn$;
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.create_credit_charged_job_with_ledger(
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
    v_credit_cost INTEGER;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'USER_ID_REQUIRED';
    END IF;

    v_credit_cost := COALESCE(p_credit_cost, 0);

    IF v_credit_cost < 0 THEN
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

    IF v_balance < v_credit_cost THEN
        RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
    END IF;

    UPDATE public.user_credits
    SET balance = balance - v_credit_cost
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
        'image_charge',
        v_job.id::text,
        -v_credit_cost,
        v_balance,
        CASE
            WHEN p_mode = 'generate' THEN '이미지 생성: ' || p_filename
            ELSE '이미지 보정: ' || p_filename
        END,
        jsonb_build_object(
            'job_id', v_job.id,
            'filename', p_filename,
            'object_key', COALESCE(p_object_key, ''),
            'mode', p_mode,
            'prompt', p_prompt,
            'type', COALESCE(p_type, 'image')
        )
    );

    RETURN to_jsonb(v_job)
        || jsonb_build_object(
            'remaining_credits', v_balance,
            'credit_cost', v_credit_cost
        );
END;
$$;
