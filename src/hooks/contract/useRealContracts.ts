
import { useState, useEffect } from 'react';
import { realContractService, Contract } from '@/services/realContractService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useRealContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadContracts = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const userContracts = await realContractService.getUserContracts();
      setContracts(userContracts);
    } catch (error) {
      console.error('Error loading contracts:', error);
      const errorMessage = 'Failed to load contracts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const uploadContract = async (file: File): Promise<Contract | null> => {
    if (!user) {
      toast.error('You must be logged in to upload contracts');
      return null;
    }

    setUploading(true);
    setError(null);
    try {
      const contract = await realContractService.uploadContract(file);
      if (contract) {
        setContracts(prev => [contract, ...prev]);
        setSelectedContract(contract);
        toast.success('Contract uploaded successfully');
      }
      return contract;
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = 'Failed to upload contract';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const selectContract = async (contractId: string) => {
    setError(null);
    try {
      const contract = await realContractService.getContract(contractId);
      if (contract) {
        setSelectedContract(contract);
      }
    } catch (error) {
      console.error('Error selecting contract:', error);
      const errorMessage = 'Failed to load contract';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    loadContracts();
  }, [user]);

  return {
    contracts,
    selectedContract,
    loading,
    uploading,
    error,
    uploadContract,
    selectContract,
    refreshContracts: loadContracts
  };
};
