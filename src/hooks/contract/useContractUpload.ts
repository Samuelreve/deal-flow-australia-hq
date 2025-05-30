
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DocumentMetadata } from '@/types/contract';

export const useContractUpload = (
  setDocuments: (docs: DocumentMetadata[]) => void,
  setSelectedDocument: (doc: DocumentMetadata | null) => void,
  setContractText: (text: string) => void
) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      toast.error('Please select a file and ensure you are logged in');
      return;
    }

    setUploading(true);
    
    try {
      // Read file content
      const text = await file.text();
      
      // Create contract metadata
      const contractMetadata: DocumentMetadata = {
        id: `contract-${Date.now()}`,
        name: file.name,
        type: file.type,
        uploadDate: new Date().toISOString(),
        status: 'completed',
        version: '1.0',
        versionDate: new Date().toISOString(),
        size: file.size,
        category: 'contract'
      };

      // Update state
      setDocuments([contractMetadata]);
      setSelectedDocument(contractMetadata);
      setContractText(text);

      toast.success('Contract uploaded successfully', {
        description: 'Your contract is ready for analysis'
      });

      // Clear the input
      e.target.value = '';
      
    } catch (error) {
      console.error('Error uploading contract:', error);
      toast.error('Failed to upload contract', {
        description: 'Please try again with a valid text file'
      });
    } finally {
      setUploading(false);
    }
  }, [user, setDocuments, setSelectedDocument, setContractText]);

  return {
    uploading,
    handleFileUpload
  };
};
