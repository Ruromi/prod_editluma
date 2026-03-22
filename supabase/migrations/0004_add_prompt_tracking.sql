-- Add prompt tracking columns to both dev and public schemas.
-- original_prompt: the user's raw input prompt
-- enhanced_prompt: the AI-rewritten prompt (from Ideogram response or local transform)

ALTER TABLE dev.jobs
    ADD COLUMN IF NOT EXISTS original_prompt TEXT,
    ADD COLUMN IF NOT EXISTS enhanced_prompt TEXT;

ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS original_prompt TEXT,
    ADD COLUMN IF NOT EXISTS enhanced_prompt TEXT;
