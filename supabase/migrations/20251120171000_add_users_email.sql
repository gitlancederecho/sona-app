-- Migration: add email column to public.users and backfill from auth.users
-- Created: 2025-11-20 17:10:00

BEGIN;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill email from auth.users where matching id
UPDATE public.users u
SET email = au.email
FROM auth.users au
WHERE u.id = au.id AND (u.email IS NULL OR u.email = '');

-- Optional: enforce uniqueness if no duplicates (skip if conflict)
DO $$
DECLARE dup_count INT;
BEGIN
  SELECT COUNT(*) INTO dup_count FROM (
    SELECT email FROM public.users WHERE email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1
  ) d;
  IF dup_count = 0 THEN
    BEGIN
      ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
    EXCEPTION WHEN duplicate_object THEN
      -- constraint already exists
    END;
  END IF;
END $$;

COMMIT;
