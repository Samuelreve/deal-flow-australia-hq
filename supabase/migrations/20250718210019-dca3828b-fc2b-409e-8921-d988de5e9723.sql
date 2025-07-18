-- Add assignment-related columns to milestones table if not already present
ALTER TABLE public.milestones 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable RLS on milestone_assignments if not already enabled
ALTER TABLE public.milestone_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view milestone assignments for deals they participate in" ON public.milestone_assignments;
DROP POLICY IF EXISTS "Sellers and admins can create milestone assignments" ON public.milestone_assignments;
DROP POLICY IF EXISTS "Sellers and admins can update milestone assignments" ON public.milestone_assignments;
DROP POLICY IF EXISTS "Sellers and admins can delete milestone assignments" ON public.milestone_assignments;

-- Add RLS policies for milestone assignments
CREATE POLICY "Users can view milestone assignments for deals they participate in" 
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

CREATE POLICY "Sellers and admins can create milestone assignments" 
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

CREATE POLICY "Sellers and admins can update milestone assignments" 
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

CREATE POLICY "Sellers and admins can delete milestone assignments" 
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