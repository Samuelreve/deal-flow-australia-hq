
-- Enable RLS on contracts table
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own contracts
CREATE POLICY "Users can view their own contracts"
ON public.contracts
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to insert their own contracts
CREATE POLICY "Users can insert their own contracts"
ON public.contracts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own contracts
CREATE POLICY "Users can update their own contracts"
ON public.contracts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own contracts
CREATE POLICY "Users can delete their own contracts"
ON public.contracts
FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on contract_questions table
ALTER TABLE public.contract_questions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own contract questions
CREATE POLICY "Users can view their own contract questions"
ON public.contract_questions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to insert their own contract questions
CREATE POLICY "Users can insert their own contract questions"
ON public.contract_questions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Enable RLS on contract_summaries table
ALTER TABLE public.contract_summaries ENABLE ROW LEVEL SECURITY;

-- Policy for users to access summaries of their own contracts
CREATE POLICY "Users can access summaries of their own contracts"
ON public.contract_summaries
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.contracts 
    WHERE contracts.id = contract_summaries.contract_id 
    AND contracts.user_id = auth.uid()
  )
);
