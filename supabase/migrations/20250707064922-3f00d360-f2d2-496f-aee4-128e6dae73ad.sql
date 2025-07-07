-- Create deal invitations table for tracking pending invitations
CREATE TABLE IF NOT EXISTS public.deal_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'lawyer', 'admin')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.deal_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view invitations for their deals" 
ON public.deal_invitations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.deal_participants dp 
    WHERE dp.deal_id = deal_invitations.deal_id 
    AND dp.user_id = auth.uid()
    AND dp.role IN ('seller', 'admin')
  )
);

CREATE POLICY "Users can create invitations for their deals" 
ON public.deal_invitations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deal_participants dp 
    WHERE dp.deal_id = deal_invitations.deal_id 
    AND dp.user_id = auth.uid()
    AND dp.role IN ('seller', 'admin')
  )
);

-- Create index for better performance
CREATE INDEX idx_deal_invitations_deal_id ON public.deal_invitations(deal_id);
CREATE INDEX idx_deal_invitations_token ON public.deal_invitations(token);
CREATE INDEX idx_deal_invitations_email ON public.deal_invitations(email);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_deal_invitations_updated_at
BEFORE UPDATE ON public.deal_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();