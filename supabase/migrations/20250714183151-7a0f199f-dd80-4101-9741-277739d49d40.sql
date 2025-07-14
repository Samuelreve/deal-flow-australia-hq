-- Drop existing RLS policies that require auth.uid() for system tokens
DROP POLICY IF EXISTS "Users can view their own DocuSign tokens" ON public.docusign_tokens;
DROP POLICY IF EXISTS "Users can create their own DocuSign tokens" ON public.docusign_tokens;
DROP POLICY IF EXISTS "Users can update their own DocuSign tokens" ON public.docusign_tokens;
DROP POLICY IF EXISTS "Users can delete their own DocuSign tokens" ON public.docusign_tokens;

-- Create more permissive policies that allow system access
-- Allow service role to manage all tokens (this covers edge functions)
CREATE POLICY "Service role can manage all DocuSign tokens" 
ON public.docusign_tokens 
FOR ALL
USING (current_setting('role') = 'service_role');

-- Allow users to view their own tokens (when authenticated)
CREATE POLICY "Authenticated users can view their own DocuSign tokens" 
ON public.docusign_tokens 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Allow users to manage their own tokens (when authenticated)
CREATE POLICY "Authenticated users can manage their own DocuSign tokens" 
ON public.docusign_tokens 
FOR ALL
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);