-- Create a table to track milestone signed document saves
CREATE TABLE IF NOT EXISTS public.milestone_signed_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL,
  deal_id UUID NOT NULL,
  saved_by_user_id UUID NOT NULL,
  envelope_id TEXT NOT NULL,
  document_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.milestone_signed_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create signed document records for milestones they can access"
ON public.milestone_signed_documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deal_participants dp
    WHERE dp.deal_id = milestone_signed_documents.deal_id 
    AND dp.user_id = auth.uid()
  ) AND saved_by_user_id = auth.uid()
);

CREATE POLICY "Users can view signed document records for deals they participate in"
ON public.milestone_signed_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deal_participants dp
    WHERE dp.deal_id = milestone_signed_documents.deal_id 
    AND dp.user_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX idx_milestone_signed_documents_milestone_id ON public.milestone_signed_documents(milestone_id);
CREATE INDEX idx_milestone_signed_documents_deal_id ON public.milestone_signed_documents(deal_id);

-- Add trigger for updated_at
CREATE TRIGGER update_milestone_signed_documents_updated_at
  BEFORE UPDATE ON public.milestone_signed_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();