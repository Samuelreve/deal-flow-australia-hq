-- Fix infinite recursion in deals and documents tables
-- The issue is that policies are calling the is_deal_participant_or_role function
-- which queries deal_participants, but also other policies are creating circular dependencies

-- First, check current policies causing issues
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('deals', 'documents') 
ORDER BY tablename, policyname;

-- Drop problematic policies on deals table
DROP POLICY IF EXISTS "deals_access" ON public.deals;
DROP POLICY IF EXISTS "Users can view deals they participate in" ON public.deals;

-- Drop problematic policies on documents table  
DROP POLICY IF EXISTS "documents_access" ON public.documents;
DROP POLICY IF EXISTS "Deal participants can add documents" ON public.documents;
DROP POLICY IF EXISTS "Deal participants can view documents" ON public.documents;
DROP POLICY IF EXISTS "Document owners can update documents" ON public.documents;

-- Create simple, non-recursive policies for deals table
CREATE POLICY "Users can create deals" 
ON public.deals 
FOR INSERT 
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can view their own deals" 
ON public.deals 
FOR SELECT 
USING (seller_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Deal owners can update their deals" 
ON public.deals 
FOR UPDATE 
USING (seller_id = auth.uid());

-- Create simple, non-recursive policies for documents table
CREATE POLICY "Users can create documents for temp deals" 
ON public.documents 
FOR INSERT 
WITH CHECK (
  -- Allow for temp deals (during creation)
  deal_id LIKE 'temp-%' 
  OR 
  -- Allow for real deals where user is seller/buyer
  EXISTS (
    SELECT 1 FROM public.deals 
    WHERE id = documents.deal_id 
    AND (seller_id = auth.uid() OR buyer_id = auth.uid())
  )
);

CREATE POLICY "Users can view documents they can access" 
ON public.documents 
FOR SELECT 
USING (
  -- Allow for temp deals (during creation)
  deal_id LIKE 'temp-%'
  OR
  -- Allow if user uploaded the document
  uploaded_by = auth.uid()
  OR
  -- Allow for real deals where user is seller/buyer  
  EXISTS (
    SELECT 1 FROM public.deals 
    WHERE id = documents.deal_id 
    AND (seller_id = auth.uid() OR buyer_id = auth.uid())
  )
);

CREATE POLICY "Users can update documents they own" 
ON public.documents 
FOR UPDATE 
USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete documents they own" 
ON public.documents 
FOR DELETE 
USING (uploaded_by = auth.uid());