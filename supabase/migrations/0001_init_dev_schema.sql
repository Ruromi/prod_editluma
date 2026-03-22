-- Sprint 1: Initial schema for EditLuma (dev environment)
-- Run against your Supabase project via the SQL editor or supabase CLI.
-- For prod, replace "dev" with "public".

CREATE SCHEMA IF NOT EXISTS dev;

-- jobs table
CREATE TABLE IF NOT EXISTS dev.jobs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename    TEXT        NOT NULL,
    object_key  TEXT        NOT NULL,           -- S3 upload path
    output_key  TEXT,                           -- S3 output path (set on completion)
    type        TEXT        NOT NULL CHECK (type IN ('image')),
    status      TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'processing', 'done', 'failed')),
    error       TEXT,                           -- error message on failure
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION dev.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
    BEFORE UPDATE ON dev.jobs
    FOR EACH ROW EXECUTE FUNCTION dev.set_updated_at();

-- Index for listing jobs by creation time
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON dev.jobs (created_at DESC);

-- RLS: enable but start open for dev (tighten in prod)
ALTER TABLE dev.jobs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by API/worker)
CREATE POLICY "service_role_all" ON dev.jobs
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
