-- Create table for tracking document signatures
CREATE TABLE document_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  envelope_id TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signer_role user_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;

-- Create policies for document signatures
CREATE POLICY "Users can view signatures for deals they participate in"
  ON document_signatures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deal_participants dp
      WHERE dp.deal_id = document_signatures.deal_id
      AND dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create signatures for deals they participate in"
  ON document_signatures
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_participants dp
      WHERE dp.deal_id = document_signatures.deal_id
      AND dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own signatures"
  ON document_signatures
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM deal_participants dp
      JOIN profiles p ON p.id = dp.user_id
      WHERE dp.deal_id = document_signatures.deal_id
      AND dp.user_id = auth.uid()
      AND p.email = document_signatures.signer_email
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_document_signatures_updated_at
  BEFORE UPDATE ON document_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();