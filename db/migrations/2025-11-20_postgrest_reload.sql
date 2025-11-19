-- Force PostgREST to reload schema after recent migrations
-- Safe to run multiple times
BEGIN;
NOTIFY pgrst, 'reload schema';
COMMIT;
