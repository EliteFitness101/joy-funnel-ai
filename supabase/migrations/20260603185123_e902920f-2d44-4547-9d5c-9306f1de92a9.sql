
-- Enable RLS with strict deny-by-default policies. All app access goes through
-- server functions / server routes using the service role, which bypasses RLS.

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.payments, public.users, public.analytics, public.referrals, public.rate_limits FROM anon, authenticated;
GRANT ALL ON public.payments, public.users, public.analytics, public.referrals, public.rate_limits TO service_role;

DROP POLICY IF EXISTS "no client access" ON public.payments;
DROP POLICY IF EXISTS "no client access" ON public.users;
DROP POLICY IF EXISTS "no client access" ON public.analytics;
DROP POLICY IF EXISTS "no client access" ON public.referrals;
DROP POLICY IF EXISTS "no client access" ON public.rate_limits;

CREATE POLICY "no client access" ON public.payments FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "no client access" ON public.users FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "no client access" ON public.analytics FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "no client access" ON public.referrals FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "no client access" ON public.rate_limits FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
