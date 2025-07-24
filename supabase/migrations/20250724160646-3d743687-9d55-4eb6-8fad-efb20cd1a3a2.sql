-- Enable realtime for document_signatures table
ALTER TABLE document_signatures REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE document_signatures;