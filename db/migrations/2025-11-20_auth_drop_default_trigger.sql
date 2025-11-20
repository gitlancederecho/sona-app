-- Fix: Supabase Auth admin.createUser failing with 500 due to a legacy trigger
-- Symptom in Auth logs: "Database error creating new user" and
-- "current transaction is aborted, commands ignored until end of transaction".
-- Likely cause: a default trigger on auth.users calling a stale public.handle_new_user()
-- that no longer matches your public.users schema.

-- Safe to run multiple times.
DO $$ BEGIN
  -- Drop trigger if it exists
  IF EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth' AND c.relname = 'users' AND t.tgname = 'on_auth_user_created'
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users';
  END IF;

  -- Drop the default function if present
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN
    EXECUTE 'DROP FUNCTION IF EXISTS public.handle_new_user()';
  END IF;
END $$;

-- Optional: if you want an auth trigger, create a minimal, schema-safe version.
-- This example NOOPs to avoid future coupling; profile creation is handled in app code.
-- Uncomment to install a benign trigger that does nothing.
--
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger
-- LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
-- BEGIN
--   -- Intentionally left blank; app code ensures profile row.
--   RETURN NEW;
-- END;
-- $$;
--
-- CREATE TRIGGER on_auth_user_created
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
