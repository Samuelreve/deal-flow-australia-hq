
import { useState, useCallback } from 'react';
import { Contract } from '@/services/realContractService';
import { DocumentMetadata } from '@/types/contract';

export const useContractState = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('🔧 useContractState:', {
    contractsCount: contracts.length,
    selectedContract: selectedContract?.id,
    loading,
    error
  });

  const updateContracts = useCallback((newContracts: Contract[]) => {
    console.log('📝 Updating contracts list, new count:', newContracts.length);
    setContracts(newContracts);
  }, []);

  const selectContract = useCallback((contractId: string) => {
    console.log('🎯 Selecting contract:', contractId);
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      console.log('✅ Contract found and selected:', {
        id: contract.id,
        name: contract.name,
        contentLength: contract.content?.length || 0
      });
      setSelectedContract(contract);
      setError(null);
    } else {
      console.error('❌ Contract not found with ID:', contractId);
      setError('Contract not found');
    }
  }, [contracts]);

  const mapAnalysisStatus = useCallback((status: string) => {
    switch (status) {
      case 'completed':
        return 'completed' as const;
      case 'processing':
        return 'analyzing' as const;
      case 'failed':
        return 'error' as const;
      default:
        return 'pending' as const;
    }
  }, []);

  const createDocumentMetadata = useCallback((contract: Contract | null): DocumentMetadata | null => {
    if (!contract) {
      console.log('📄 No selected contract, no document metadata');
      return null;
    }

    const metadata = {
      id: contract.id,
      name: contract.name,
      type: contract.mime_type,
      uploadDate: contract.upload_date,
      status: mapAnalysisStatus(contract.analysis_status),
      version: '1.0',
      versionDate: contract.upload_date,
      size: contract.file_size,
      category: 'contract'
    };

    console.log('📄 Created document metadata:', metadata);
    return metadata;
  }, [mapAnalysisStatus]);

  return {
    contracts,
    selectedContract,
    loading,
    error,
    updateContracts,
    selectContract,
    setLoading,
    setError,
    createDocumentMetadata
  };
};
