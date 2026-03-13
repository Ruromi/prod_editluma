-- Production-only SQL for account soft delete support.
-- Run this in the Supabase SQL Editor for the production project.

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_reason TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'profiles_account_status_check'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_account_status_check
            CHECK (account_status IN ('active', 'deleted'));
    END IF;
END
$$;

UPDATE public.profiles
SET account_status = 'deleted'
WHERE deleted_at IS NOT NULL
  AND account_status <> 'deleted';

CREATE INDEX IF NOT EXISTS public_profiles_account_status_idx
    ON public.profiles (account_status, deleted_at DESC NULLS LAST);
