
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Contract {
  id: string;
  name: string;
  content: string;
  uploadedAt: string;
  size: number;
}

export const useRealContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const uploadContract = async (file: File) => {
    if (!user) {
      throw new Error('User must be logged in to upload contracts');
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Extract text based on file type
      let content = '';
      if (file.type === 'text/plain') {
        content = await file.text();
      } else {
        // For other file types, use demo content
        content = `Sample contract content extracted from ${file.name}. This would contain the actual contract text in a real implementation.`;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create new contract
      const newContract: Contract = {
        id: `contract-${Date.now()}`,
        name: file.name,
        content,
        uploadedAt: new Date().toISOString(),
        size: file.size
      };

      setContracts(prev => [...prev, newContract]);
      setSelectedContract(newContract);
      
      toast.success('Contract uploaded successfully');
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const selectContract = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      setSelectedContract(contract);
    }
  };

  // Load contracts on mount
  useEffect(() => {
    const loadContracts = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would load from Supabase
        // For now, we'll use demo data
        setContracts([]);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadContracts();
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    contracts,
    selectedContract,
    loading,
    uploading,
    uploadProgress,
    error,
    uploadContract,
    selectContract
  };
};
