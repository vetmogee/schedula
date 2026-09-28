-- Lock down the Supabase Data API (PostgREST).
--
-- All application data access goes through Prisma, which connects as the
-- privileged `postgres` role and is not affected by RLS or these grants.
-- The public anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is only used for
-- Supabase Auth, so the `anon` / `authenticated` roles need no table access.
--
-- Before this migration RLS was disabled on every table and both roles held
-- full SELECT/INSERT/UPDATE/DELETE/TRUNCATE, meaning anyone with the anon key
-- could read or wipe the whole database via <project>.supabase.co/rest/v1.

-- 1. Enable RLS (deny-by-default: no policies are defined on purpose).
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_services   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_pictures     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loops              ENABLE ROW LEVEL SECURITY;

-- 2. Remove Data API privileges on existing objects.
REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- 3. Stop future tables created by this role from being auto-granted.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES    FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
