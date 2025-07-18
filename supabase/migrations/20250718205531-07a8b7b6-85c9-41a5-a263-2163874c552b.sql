-- First check if milestone_assignments table needs any updates
-- Add assignment-related columns to milestones table if not already present
ALTER TABLE public.milestones 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add RLS policies for milestone assignments
CREATE POLICY IF NOT EXISTS "Users can view milestone assignments for deals they participate in" 
ON public.milestone_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.deal_participants dp ON m.deal_id = dp.deal_id
    WHERE m.id = milestone_assignments.milestone_id 
    AND dp.user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Sellers and admins can create milestone assignments" 
ON public.milestone_assignments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.deal_participants dp ON m.deal_id = dp.deal_id
    WHERE m.id = milestone_assignments.milestone_id 
    AND dp.user_id = auth.uid()
    AND dp.role IN ('seller', 'admin')
  )
);

CREATE POLICY IF NOT EXISTS "Sellers and admins can update milestone assignments" 
ON public.milestone_assignments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.deal_participants dp ON m.deal_id = dp.deal_id
    WHERE m.id = milestone_assignments.milestone_id 
    AND dp.user_id = auth.uid()
    AND dp.role IN ('seller', 'admin')
  )
);

CREATE POLICY IF NOT EXISTS "Sellers and admins can delete milestone assignments" 
ON public.milestone_assignments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.deal_participants dp ON m.deal_id = dp.deal_id
    WHERE m.id = milestone_assignments.milestone_id 
    AND dp.user_id = auth.uid()
    AND dp.role IN ('seller', 'admin')
  )
);