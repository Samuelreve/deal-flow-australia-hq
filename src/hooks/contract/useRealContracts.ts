
import { useState, useEffect } from 'react';
import { realContractService, Contract } from '@/services/realContractService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useRealContracts = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load user contracts
  const loadContracts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userContracts = await realContractService.getUserContracts();
      setContracts(userContracts);
    } catch (error: any) {
      console.error('Failed to load contracts:', error);
      setError('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  // Upload a new contract with real text extraction
  const uploadContract = async (file: File): Promise<Contract | null> => {
    if (!user) {
      toast.error('You must be logged in to upload contracts');
      return null;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const uploadedContract = await realContractService.uploadContract(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadedContract) {
        // Convert to Contract type
        const contract: Contract = {
          ...uploadedContract,
          upload_date: uploadedContract.created_at, // Add the missing upload_date property
          analysis_status: 'completed',
          file_path: '',
          user_id: user.id
        };
        
        // Add to contracts list
        setContracts(prev => [contract, ...prev]);
        
        // Auto-select the uploaded contract
        setSelectedContract(contract);
        
        toast.success('Contract uploaded and analyzed successfully!', {
          description: 'You can now ask questions about this contract.'
        });
        
        return contract;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload contract');
      toast.error('Upload failed', {
        description: error.message || 'Please try again'
      });
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Select a contract for analysis
  const selectContract = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      setSelectedContract(contract);
      setError(null);
    }
  };

  // Analyze the selected contract
  const analyzeSelectedContract = async () => {
    if (!selectedContract) return null;
    
    try {
      setLoading(true);
      const analysis = await realContractService.analyzeContract(selectedContract.id);
      return analysis;
    } catch (error: any) {
      console.error('Analysis error:', error);
      setError('Failed to analyze contract');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Ask a question about the selected contract
  const askQuestion = async (question: string) => {
    if (!selectedContract) {
      toast.error('No contract selected');
      return null;
    }

    try {
      setLoading(true);
      const response = await realContractService.askQuestion(selectedContract.id, question);
      return response;
    } catch (error: any) {
      console.error('Question error:', error);
      setError('Failed to process question');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load contracts when user changes
  useEffect(() => {
    if (user) {
      loadContracts();
    } else {
      setContracts([]);
      setSelectedContract(null);
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
    selectContract,
    analyzeSelectedContract,
    askQuestion,
    refreshContracts: loadContracts
  };
};
