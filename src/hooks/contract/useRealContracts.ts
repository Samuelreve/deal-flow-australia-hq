
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useContractDocumentUpload } from './useContractDocumentUpload';

interface Contract {
  id: string;
  name: string;
  content?: string;
  file_size: number;
  upload_date: string;
  analysis_status: string;
}

export const useRealContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    handleFileUpload: uploadFile,
    isUploading: uploading,
    uploadProgress,
    error: uploadError
  } = useContractDocumentUpload({
    onUploadSuccess: () => {
      // Refresh contracts list after successful upload
      fetchContracts();
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
    }
  });

  const fetchContracts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        toast.error('Failed to load contracts');
        return;
      }

      const formattedContracts = data.map(contract => ({
        id: contract.id,
        name: contract.name,
        content: contract.content,
        file_size: contract.file_size,
        upload_date: contract.upload_date || contract.created_at,
        analysis_status: contract.analysis_status || 'pending'
      }));

      setContracts(formattedContracts);
    } catch (error) {
      console.error('Error in fetchContracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const selectContract = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    setSelectedContract(contract || null);
  };

  const uploadContract = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.files = (() => {
        const dt = new DataTransfer();
        dt.items.add(file);
        return dt.files;
      })();

      const event = {
        target: fileInput,
        currentTarget: fileInput
      } as React.ChangeEvent<HTMLInputElement>;

      uploadFile(event)
        .then(() => resolve())
        .catch(reject);
    });
  };

  return {
    contracts,
    selectedContract,
    loading,
    uploading,
    uploadProgress,
    error: uploadError,
    uploadContract,
    selectContract,
    refreshContracts: fetchContracts
  };
};
