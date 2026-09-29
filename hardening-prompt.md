# Prompt: security hardening & production readiness (Next.js + Supabase + Prisma + Vercel)

Copy everything below the line into your AI coding agent, in the root of the project you want to fix.

---

You are auditing and fixing this project. It is (or may be) a Next.js App Router app that uses Supabase (Auth and/or Postgres), Prisma, and is deployed on Vercel, possibly also with Docker. Work through the checklist below in order.

## Ground rules

- **Detect before fixing.** For every item, first check whether it applies to this project and say what you found. Skip items that don't apply and say so.
- **Verify every fix** with evidence: a build, a read-only SQL/catalog query, logs, or a deploy status. Don't claim something works without having checked it.
- **Ask before** anything that affects production or shared resources: database changes on a live project, firewall rules, domains, environment variables on the hosting provider, rotating keys, merging or deploying.
- **Don't start local dev/production servers or curl-probe them** without asking first. If you do start one, stop it afterwards.
- **Never print secrets.** When inspecting `.env` files, show variable names only, redact values. Never commit `.env` files.
- Match the existing code style. Keep changes minimal and focused.
- Commit only when asked, on a new branch. Finish with a report: what changed and why, how it was verified, and what the user still has to do by hand.

## 1. Database exposure via the Supabase Data API (critical)

Tables created by Prisma (or any external migration tool) in Supabase's `public` schema do **not** get Row Level Security (RLS) automatically, and Supabase grants the `anon`/`authenticated` roles access to them. Because the anon key is public (anything prefixed `NEXT_PUBLIC_` ships to the browser), anyone can then read or wipe the whole database via `https://<project>.supabase.co/rest/v1/`.

1. Check with read-only queries:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
   SELECT grantee, table_name, string_agg(privilege_type, ',')
   FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated')
   GROUP BY grantee, table_name;
   ```
2. Check whether the app ever queries tables through the Supabase client (`supabase.from(...)`). If **all** data access goes through Prisma/server code, lock the Data API down completely:
   ```sql
   ALTER TABLE public.<each_table> ENABLE ROW LEVEL SECURITY;  -- no policies = deny by default
   REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM anon, authenticated;
   REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
   REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES    FROM anon, authenticated;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
   ```
   If the client *does* query tables, write real per-row policies instead: `TO authenticated` plus an ownership check like `(select auth.uid()) = user_id`. UPDATE policies need both `USING` and `WITH CHECK`.
3. Save the SQL as a new migration file so it's version-controlled. **Before applying, run `prisma migrate status`.** If the migration history is out of sync with the live DB (e.g. the schema was created with `db push`), do **not** run `migrate deploy`, because it would try to re-create existing tables. Apply the file with `prisma db execute --file <path>` instead, and tell the user the history needs baselining with `prisma migrate resolve --applied`.
4. Verify: re-run the catalog queries (RLS on everywhere, zero anon/authenticated grants). Run a query as the anon role inside a transaction (`SET LOCAL ROLE anon`) and confirm `permission denied`. Confirm Prisma can still read data.
5. Run the Supabase security and performance advisors, if available (MCP `get_advisors` or `supabase db advisors`). "RLS enabled, no policy" is expected after a deliberate lockdown.

## 2. Supabase key mix-ups

Decode the JWT payload (the middle segment only, never the signature) of every Supabase key in the env files and check its `role` claim. Print only the role.

- The key used by browser code (`NEXT_PUBLIC_SUPABASE_ANON_KEY` / publishable key) **must** be `anon`. A `service_role` key there is critical: rotate it immediately.
- A server variable *named* anon key that actually contains the `service_role` key means all server auth calls run with admin rights. Replace it with the real anon key in local env files, and tell the user to fix it in the hosting provider's env vars too.
- If a service-role key was exposed anywhere (browser bundle, Docker image, repo), recommend rotation. Supabase's new publishable/secret API keys allow a zero-downtime switch.

## 3. Authorization in server actions and route handlers (IDOR)

Every exported `"use server"` function is a publicly callable endpoint, even if no UI uses it. For each server action and API route:

- It must authenticate the caller by *verifying* the token (e.g. `supabase.auth.getUser(token)`), not just checking that a cookie exists.
- It must check that the caller owns or may access the resource identified by any ID parameter (e.g. `salonId`, `bookingId`), and scope queries by the caller's ID.
- Pay special attention to anything returning other users' personal data (names, emails). Add an ownership check, or delete the function if it's unused.

## 4. Don't leak internal errors to the client

Find places that return `error.message` (Prisma errors, exceptions, auth errors) to the browser. Log the details server-side and return generic messages instead. For errors that are meant for users (e.g. "this slot was just booked"), use a dedicated error class and only pass through messages of that class.

## 5. Middleware / proxy actually running

- Next.js only loads middleware from `middleware.ts` (renamed `proxy.ts` in Next 16, exporting `proxy`) at the project root or directly in `src/`. A file in any other folder (e.g. `src/middleware/middleware.ts`) is dead code. Check the `next build` output for `ƒ Proxy (Middleware)`.
- Make sure the matcher covers every protected route.
- Treat it as a UX redirect layer only; pages and actions must still verify the token themselves.
- Watch for redirect loops: a rule like "cookie present on /login → redirect to /dashboard" loops forever when the cookie holds an expired token. Verify the token on that path and delete the cookie if it's invalid.

## 6. Open redirects

Find any `?redirect=` / `?next=` / `returnTo` parameters that are passed to `window.location`, `router.push` or `redirect()`. Only allow same-site paths: must start with `/`, must not start with `//` or `/\`. Otherwise fall back to `/`.

## 7. Docker images leaking secrets

- `.dockerignore` must exclude **all** env files (`.env*`), not just `.env*.local`. Otherwise `COPY . .` bakes the service-role key and DB password into image layers.
- `NEXT_PUBLIC_*` values are inlined at build time, so pass them as build `ARG`s (e.g. docker-compose `build.args` interpolated from `.env`). Provide all other secrets only at runtime (`env_file`).
- If old images were pushed to a registry, tell the user to rotate the secrets they contained.

## 8. Rate limiting

Server-side auth calls reach Supabase from the server's IP, so Supabase's per-IP limits don't protect individual endpoints. Brute-forcing passwords and draining the auth email quota are both possible.

- Check for existing rate limiting: libraries (`@upstash/ratelimit` etc.), `vercel.json`/`vercel.ts`, and the Vercel Firewall config.
- Recommend a Vercel WAF rate-limit rule, and ask before creating it: method `POST` AND path in [login, register, password-reset routes] → rate limit, fixed window, 60 s, ~10 requests, keyed by IP, respond 429.

## 9. Auth emails (Supabase)

- The built-in Supabase email service is limited to **2 emails/hour** and only delivers to project team members. Production needs custom SMTP. For Resend: host `smtp.resend.com`, port `465`, user `resend`, password = API key. The sending domain must be verified in Resend (SPF/DKIM DNS records). Then raise Auth → Rate Limits → emails/hour.
- Replace hardcoded URLs in `redirectTo` / `emailRedirectTo` with a `SITE_URL` env var (fallback to the production URL). Set it per environment: `http://localhost:3000` locally, the real domain in production.
- Set `emailRedirectTo` on `signUp` so the confirmation link lands somewhere sensible (e.g. `/login`).
- Map Supabase's `over_email_send_rate_limit` error code to a friendly message.
- Remind the user to set Auth → URL Configuration (Site URL and redirect allow-list, including localhost for dev).
- Auth email templates live in the Supabase dashboard; app emails (booking confirmations etc.) belong in code.

## 10. Transactional email via the Resend SDK (only if the user wants app emails)

- Install `resend`; keep the key in `RESEND_API_KEY` (env), never hardcoded.
- Create a shared server-only client (`src/lib/resend.ts`) with a comment that it must never be imported into client components.
- Add a test script (`scripts/send-test-email.ts`, npm script `send-test-email`) that refuses to run with a placeholder key. Note that `onboarding@resend.dev` only delivers to the account owner's own address until a domain is verified.

## 11. Cookies and legal pages (EU)

- Inventory what the app actually stores: grep for cookie `set`/`delete` calls and `localStorage` use, and include library storage (e.g. `next-themes` → `theme`; the Supabase browser client → `sb-…-auth-token`). Check for analytics/tracking packages.
- If everything is strictly necessary (auth, preferences, security), no consent is required. Add:
  - a dismissible **informational** cookie notice (client component; remember dismissal in `localStorage` with try/catch; render only after mount to avoid hydration mismatch), and
  - a `/cookies` policy page listing each item's name, type, purpose and duration.
  If there are analytics or marketing cookies, you need a real consent banner that blocks them until the user opts in. Say so and ask the user how to proceed.
- Add a `/terms` Terms of Service page that matches how the product actually works (who provides the service, whether payments are processed, what data is shared with whom, user obligations, acceptable use, liability, termination, governing law).
- Put the contact email, governing law and "last updated" date in one shared constants file with clearly marked placeholders. Use a fixed "last updated" date, not `new Date()`.
- Add "By creating an account, you agree to the Terms of Service and Privacy Policy" (with links) to sign-up forms, and add footer links.
- Fix false claims in an existing privacy policy (e.g. "we analyze usage with cookies" when there are no analytics).
- Tell the user the legal text is a starting point, not legal advice.

## 12. Login UX

- Show errors on the form when credentials are wrong.
- When credentials are accepted, show the loading screen **immediately in the same page** (component state), then navigate with a full page load (`window.location.href`) so server layouts re-render with the new cookie.
- Don't route through a separate "logging in" page (that costs an extra server round trip before the spinner appears), and never add artificial `setTimeout` delays.

## 13. Performance basics

- **Region colocation:** check where functions run (`x-vercel-id` response header: `<edge>::<function region>::…`) versus the database region. If they differ (e.g. `iad1` vs Supabase `eu-central-1`), pin functions next to the DB, e.g. `vercel.json` → `{ "regions": ["fra1"] }`.
- **Atomic writes:** replace read-then-write counters (`findFirst` + `update({ count: x + 1 })`) with a single `upsert`/`update` using `{ increment: 1 }` on a fixed key.
- **Prisma logging:** per-query logging with the pgbouncer pooler (`?pgbouncer=true`) is extremely noisy because every query is wrapped in `BEGIN`/`DEALLOCATE ALL`/`COMMIT`. Make query logging opt-in (e.g. `PRISMA_LOG_QUERIES=1`).
- **Avoid side effects in page renders** (like counters incremented on every render); note them to the user.

## Final report

End with:
1. A table of changes: file, what changed, and why.
2. Verification evidence for each item.
3. Anything skipped or blocked, and why.
4. A checklist of manual steps for the user: dashboard settings, env vars, DNS, key rotation, legal placeholders, deploying.
