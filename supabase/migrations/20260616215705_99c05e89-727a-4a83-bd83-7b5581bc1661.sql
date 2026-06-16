
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS rsid TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS payments_rsid_idx ON public.payments(rsid);

CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  rsid TEXT NOT NULL,
  plan TEXT NOT NULL,
  access_granted BOOLEAN NOT NULL DEFAULT true,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rsid, plan)
);

GRANT ALL ON public.entitlements TO service_role;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no client access entitlements"
  ON public.entitlements FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE INDEX IF NOT EXISTS entitlements_user_idx ON public.entitlements(user_id);
CREATE INDEX IF NOT EXISTS entitlements_rsid_idx ON public.entitlements(rsid);
