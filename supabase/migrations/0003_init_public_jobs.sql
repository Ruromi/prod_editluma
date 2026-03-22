-- Public schema jobs table for EditLuma (prod / default Supabase exposure)
-- Mirrors dev.jobs (0001 + 0002) but targets the public schema which is
-- exposed by default in Supabase without extra schema-exposure config.

-- jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename    TEXT        NOT NULL,
    object_key  TEXT        NOT NULL,           -- S3 upload path
    output_key  TEXT,                           -- S3 output path (set on completion)
    type        TEXT        NOT NULL CHECK (type IN ('image')),
    status      TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'processing', 'done', 'failed')),
    error       TEXT,                           -- error message on failure
    mode        TEXT        CHECK (mode IN ('enhance', 'generate')),
    prompt      TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index for listing jobs by creation time
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON public.jobs (created_at DESC);

-- RLS: service role full access (used by API/worker)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.jobs
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
