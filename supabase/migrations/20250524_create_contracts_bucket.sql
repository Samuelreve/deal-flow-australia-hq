
-- Create contracts storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('contracts', 'Contracts', false, 52428800)
ON CONFLICT (id) DO NOTHING;
