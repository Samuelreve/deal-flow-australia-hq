-- Create business_document storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('business_document', 'business_document', true);

-- Create policies for business_document bucket
CREATE POLICY "Users can upload their own business documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'business_document' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own business documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'business_document' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own business documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'business_document' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own business documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'business_document' AND auth.uid()::text = (storage.foldername(name))[1]);