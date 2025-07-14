-- Create table to store DocuSign authentication tokens
CREATE TABLE IF NOT EXISTS public.docusign_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  account_id TEXT NOT NULL,
  base_uri TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.docusign_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own DocuSign tokens" 
ON public.docusign_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own DocuSign tokens" 
ON public.docusign_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own DocuSign tokens" 
ON public.docusign_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own DocuSign tokens" 
ON public.docusign_tokens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_docusign_tokens_updated_at
BEFORE UPDATE ON public.docusign_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();