-- Create signed_document bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('signed_document', 'signed_document', true)
ON CONFLICT (id) DO NOTHING;