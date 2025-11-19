-- Migration: add unique handle column to users
-- Timestamp: 2025-11-20

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS handle TEXT;

-- Backfill base handles from name (alphanumeric only, lowercase)
UPDATE users
SET handle = lower(regexp_replace(coalesce(name,''), '[^a-zA-Z0-9]+', '', 'g'))
WHERE handle IS NULL;

-- Fallback for empty results -> user_<first6_of_id>
UPDATE users
SET handle = 'user_' || substr(id::text, 1, 6)
WHERE handle = '' OR handle IS NULL;

-- Deduplicate collisions by appending _<row_number>
WITH ranked AS (
    SELECT id, handle, ROW_NUMBER() OVER (PARTITION BY handle ORDER BY id) AS rn
    FROM users
)
UPDATE users u
SET handle = u.handle || '_' || ranked.rn
FROM ranked
WHERE u.id = ranked.id AND ranked.rn > 1;

-- Enforce lowercase formatting (optional normalization pass)
UPDATE users
SET handle = lower(handle);

-- Add uniqueness + not null constraint
ALTER TABLE users
    ADD CONSTRAINT users_handle_key UNIQUE (handle);

ALTER TABLE users
    ALTER COLUMN handle SET NOT NULL;

COMMIT;
