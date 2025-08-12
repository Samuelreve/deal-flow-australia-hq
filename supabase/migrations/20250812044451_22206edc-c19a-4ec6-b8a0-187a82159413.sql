-- Deal Copilot (AU) support: add minimal cross-border fields to deals
-- Safe to run multiple times via IF NOT EXISTS

ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'AUD',
  ADD COLUMN IF NOT EXISTS counterparty_country text,
  ADD COLUMN IF NOT EXISTS cross_border boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS counterparty_name text;

-- Note: RLS remains unchanged; these are non-sensitive fields with sensible defaults.
