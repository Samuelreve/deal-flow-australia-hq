
-- Drop the insecure DELETE policy that allows anyone to delete any profile
DROP POLICY IF EXISTS "Secure: System delete only" ON public.profiles;

-- Create a secure DELETE policy - no client-side deletes allowed
CREATE POLICY "Secure: No client delete"
ON public.profiles
FOR DELETE
USING (false);
