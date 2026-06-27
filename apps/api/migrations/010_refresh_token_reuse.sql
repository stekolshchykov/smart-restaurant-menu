ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS previous_token_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_previous_hash
    ON refresh_tokens(previous_token_hash);
