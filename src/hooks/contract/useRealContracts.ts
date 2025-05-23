
import { useState, useEffect } from 'react';
import { realContractService, Contract } from '@/services/realContractService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useRealContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const loadContracts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userContracts = await realContractService.getUserContracts();
      setContracts(userContracts);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('Failed to load contracts');
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
    try {
      const contract = await realContractService.uploadContract(file);
      if (contract) {
        setContracts(prev => [contract, ...prev]);
        setSelectedContract(contract);
        toast.success('Contract uploaded successfully');
      }
      return contract;
    } finally {
      setUploading(false);
    }
  };

  const selectContract = async (contractId: string) => {
    try {
      const contract = await realContractService.getContract(contractId);
      if (contract) {
        setSelectedContract(contract);
      }
    } catch (error) {
      console.error('Error selecting contract:', error);
      toast.error('Failed to load contract');
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
    uploadContract,
    selectContract,
    refreshContracts: loadContracts
  };
};
