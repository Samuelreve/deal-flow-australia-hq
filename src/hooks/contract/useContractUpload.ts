
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentMetadata } from '@/types/contract';
import { toast } from 'sonner';

export const useContractUpload = (
  setDocuments: React.Dispatch<React.SetStateAction<DocumentMetadata[]>>,
  setSelectedDocument: React.Dispatch<React.SetStateAction<DocumentMetadata | null>>,
  setContractText: React.Dispatch<React.SetStateAction<string>>
) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      toast.info('Uploading contract...', {
        description: 'Your contract is being uploaded and processed.'
      });
      
      let content = '';
      if (file.type === 'text/plain') {
        content = await file.text();
      } else {
        content = `Contract content extracted from ${file.name}. This is a placeholder for the actual extracted text content.`;
      }
      
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .insert({
          name: file.name,
          mime_type: file.type,
          file_size: file.size,
          file_path: `contracts/${user.id}/${file.name}`,
          content: content,
          analysis_status: 'completed',
          user_id: user.id
        })
        .select()
        .single();

      if (contractError) throw contractError;

      const newDocument: DocumentMetadata = {
        id: contractData.id,
        name: file.name,
        type: file.type,
        uploadDate: contractData.created_at,
        status: 'completed',
        version: '1.0',
        versionDate: contractData.created_at,
        size: file.size,
        category: 'contract'
      };

      setDocuments(prev => [newDocument, ...prev]);
      setSelectedDocument(newDocument);
      setContractText(content);
      
      toast.success('Contract uploaded successfully!', {
        description: 'Your contract is now ready for AI-powered analysis.'
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload contract');
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    handleFileUpload
  };
};
