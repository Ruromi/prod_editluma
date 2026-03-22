-- Sprint 2: Add mode and prompt columns to jobs table
-- Backward-compatible ALTER TABLE (existing rows will have NULL mode/prompt).

ALTER TABLE dev.jobs
    ADD COLUMN IF NOT EXISTS mode   TEXT CHECK (mode IN ('enhance', 'generate')),
    ADD COLUMN IF NOT EXISTS prompt TEXT;
