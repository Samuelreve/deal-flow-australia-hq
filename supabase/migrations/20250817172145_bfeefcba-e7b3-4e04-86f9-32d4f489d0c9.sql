-- Create deal category enum
CREATE TYPE public.deal_category AS ENUM (
  'ip_transfer',
  'real_estate', 
  'cross_border',
  'micro_deals',
  'business_sale',
  'other'
);

-- Add deal_category column to deals table
ALTER TABLE public.deals ADD COLUMN deal_category public.deal_category DEFAULT 'business_sale';

-- Add category-specific fields
ALTER TABLE public.deals ADD COLUMN ip_assets jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.deals ADD COLUMN property_details jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.deals ADD COLUMN cross_border_details jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.deals ADD COLUMN micro_deal_details jsonb DEFAULT '{}'::jsonb;

-- Create enhanced status workflow enum for different categories
CREATE TYPE public.deal_status_enhanced AS ENUM (
  'draft',
  'active',
  'due_diligence',
  'contract_negotiation',
  'settlement', -- real estate specific
  'ip_transfer_pending', -- IP specific
  'regulatory_approval', -- cross-border specific
  'pending',
  'completed',
  'cancelled'
);

-- Function to get allowed status transitions based on category
CREATE OR REPLACE FUNCTION public.get_allowed_status_transitions(
  p_current_status public.deal_status,
  p_deal_category public.deal_category,
  p_user_role public.user_role
) RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  allowed_statuses text[] := '{}';
BEGIN
  -- Base transitions available to all
  CASE p_current_status::text
    WHEN 'draft' THEN
      allowed_statuses := ARRAY['active', 'cancelled'];
    WHEN 'active' THEN
      allowed_statuses := ARRAY['due_diligence', 'cancelled'];
    WHEN 'due_diligence' THEN
      allowed_statuses := ARRAY['contract_negotiation', 'active', 'cancelled'];
    WHEN 'contract_negotiation' THEN
      -- Category-specific transitions
      CASE p_deal_category
        WHEN 'real_estate' THEN
          allowed_statuses := ARRAY['settlement', 'due_diligence', 'cancelled'];
        WHEN 'ip_transfer' THEN
          allowed_statuses := ARRAY['ip_transfer_pending', 'due_diligence', 'cancelled'];
        WHEN 'cross_border' THEN
          allowed_statuses := ARRAY['regulatory_approval', 'due_diligence', 'cancelled'];
        ELSE
          allowed_statuses := ARRAY['pending', 'due_diligence', 'cancelled'];
      END CASE;
    WHEN 'settlement', 'ip_transfer_pending', 'regulatory_approval', 'pending' THEN
      allowed_statuses := ARRAY['completed', 'contract_negotiation', 'cancelled'];
    ELSE
      allowed_statuses := '{}';
  END CASE;
  
  -- Role-based restrictions
  IF p_user_role != 'admin' AND p_user_role != 'seller' THEN
    -- Buyers and other roles can only cancel active deals
    allowed_statuses := ARRAY(SELECT unnest(allowed_statuses) WHERE unnest(allowed_statuses) IN ('cancelled'));
  END IF;
  
  RETURN allowed_statuses;
END;
$$;