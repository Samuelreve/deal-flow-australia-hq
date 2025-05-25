
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Contract {
  id: string;
  name: string;
  content?: string;
  file_size: number;
  upload_date: string;
  analysis_status: string;
}

const mockContracts: Contract[] = [
  {
    id: '1',
    name: 'Service Agreement.pdf',
    file_size: 1240000,
    upload_date: '2025-05-01T10:00:00Z',
    analysis_status: 'completed'
  },
  {
    id: '2',
    name: 'NDA Contract.pdf',
    file_size: 890000,
    upload_date: '2025-05-10T14:30:00Z',
    analysis_status: 'completed'
  }
];

export const useRealContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch contracts on mount
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setContracts(mockContracts);
        setError(null);
      } catch (e) {
        console.error('Error fetching contracts:', e);
        setError('Failed to load contracts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const refreshContracts = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setContracts(mockContracts);
      setError(null);
    } catch (e) {
      console.error('Error refreshing contracts:', e);
      setError('Failed to refresh contracts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadContract = useCallback(async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size should be less than 10MB');
      }

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF, DOCX, and TXT files are allowed');
      }
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 300);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Create a new mock contract
      const newContract: Contract = {
        id: Date.now().toString(),
        name: file.name,
        content: 'This is the mock content of the uploaded contract...',
        file_size: file.size,
        upload_date: new Date().toISOString(),
        analysis_status: 'processing'
      };
      
      setContracts(prev => [newContract, ...prev]);
      setSelectedContract(newContract);
      
      // Simulate processing completion after a delay
      setTimeout(() => {
        setContracts(prev => prev.map(c => 
          c.id === newContract.id 
            ? { ...c, analysis_status: 'completed' } 
            : c
        ));
        
        if (selectedContract && selectedContract.id === newContract.id) {
          setSelectedContract(prev => prev ? { ...prev, analysis_status: 'completed' } : null);
        }
      }, 5000);
      
      return newContract;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to upload contract';
      setError(errorMsg);
      toast.error(errorMsg);
      throw e;
    } finally {
      setUploading(false);
    }
  }, [selectedContract]);

  const selectContract = useCallback(async (contractId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const contract = contracts.find(c => c.id === contractId);
      
      if (!contract) {
        throw new Error('Contract not found');
      }
      
      // Simulate API call to get contract content
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const contractWithContent = { 
        ...contract, 
        content: contract.content || 'This is the mock content of the selected contract...'
      };
      
      setSelectedContract(contractWithContent);
      return contractWithContent;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to select contract';
      setError(errorMsg);
      toast.error(errorMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [contracts]);

  return {
    contracts,
    selectedContract,
    loading,
    uploading,
    uploadProgress,
    error,
    uploadContract,
    selectContract,
    refreshContracts
  };
};
