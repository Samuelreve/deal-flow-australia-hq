-- Fix the profiles policy that's still causing infinite recursion
DROP POLICY IF EXISTS "profiles_access_policy" ON public.profiles;

-- Create the security definer function to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create the is_deal_participant_or_role function
CREATE OR REPLACE FUNCTION public.is_deal_participant_or_role(p_deal_id UUID, p_required_role TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID := auth.uid();
  user_is_participant BOOLEAN := FALSE;
  user_role TEXT;
BEGIN
  -- If not authenticated, they are not a participant
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user is a participant in this deal
  SELECT EXISTS (
    SELECT 1 FROM public.deal_participants
    WHERE deal_id = p_deal_id AND user_id = current_user_id
  ) INTO user_is_participant;

  -- If they are not a participant, return FALSE
  IF NOT user_is_participant THEN
      RETURN FALSE;
  END IF;

  -- If a required role is specified, check the user's role
  IF p_required_role IS NOT NULL THEN
    SELECT role INTO user_role FROM public.profiles WHERE id = current_user_id;
    RETURN user_role = p_required_role;
  END IF;

  -- If no required role, and they are a participant, return TRUE
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Now create clean RLS policies

-- Profiles policies (non-recursive)
CREATE POLICY "profiles_all_access" ON public.profiles FOR ALL TO public 
USING (
  auth.uid() = id OR 
  is_professional = true OR 
  public.get_current_user_role() = 'admin'
) 
WITH CHECK (auth.uid() = id);

-- Deal participants policies
CREATE POLICY "deal_participants_access" ON public.deal_participants FOR ALL TO authenticated
USING (public.is_deal_participant_or_role(deal_id))
WITH CHECK (public.is_deal_participant_or_role(deal_id));

-- Deals policies
CREATE POLICY "deals_access" ON public.deals FOR ALL TO authenticated
USING (public.is_deal_participant_or_role(id))
WITH CHECK (public.is_deal_participant_or_role(id));

-- Documents policies
CREATE POLICY "documents_access" ON public.documents FOR ALL TO authenticated
USING (public.is_deal_participant_or_role(deal_id))
WITH CHECK (public.is_deal_participant_or_role(deal_id));

-- Document versions policies
CREATE POLICY "document_versions_access" ON public.document_versions FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.documents d 
    WHERE d.id = document_versions.document_id 
    AND public.is_deal_participant_or_role(d.deal_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents d 
    WHERE d.id = document_versions.document_id 
    AND public.is_deal_participant_or_role(d.deal_id)
  )
);