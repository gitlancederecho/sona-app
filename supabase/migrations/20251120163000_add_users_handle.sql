-- Migration: ensure users.handle exists with uniqueness
-- Created: 2025-11-20 16:30:00

BEGIN;

-- Add column if missing
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS handle TEXT;

-- Backfill base handles from name (alphanumeric only, lowercase)
UPDATE public.users
SET handle = lower(regexp_replace(coalesce(name,''), '[^a-zA-Z0-9]+', '', 'g'))
WHERE handle IS NULL;

-- Fallback for empty results -> user_<first6_of_id>
UPDATE public.users
SET handle = 'user_' || substr(id::text, 1, 6)
WHERE (handle = '' OR handle IS NULL);

-- Deduplicate collisions by appending _<row_number>
WITH ranked AS (
    SELECT id, handle, ROW_NUMBER() OVER (PARTITION BY handle ORDER BY id) AS rn
    FROM public.users
)
UPDATE public.users u
SET handle = u.handle || '_' || ranked.rn
FROM ranked
WHERE u.id = ranked.id AND ranked.rn > 1;

-- Normalize to lowercase
UPDATE public.users SET handle = lower(handle);

-- Add unique constraint if absent
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_handle_key'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_handle_key UNIQUE (handle);
  END IF;
END $$;

-- Set NOT NULL after ensuring values
ALTER TABLE public.users ALTER COLUMN handle SET NOT NULL;

COMMIT;
