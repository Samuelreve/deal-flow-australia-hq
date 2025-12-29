
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
    if (!user) {
      return;
    }
    
    try {
      setLoading(true);
      const userContracts = await realContractService.getUserContracts();
      setContracts(userContracts);
    } catch (error: any) {
      console.error('Failed to load contracts:', error);
      setError('Failed to load contracts: ' + error.message);
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
          const newProgress = prev + 15;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      const uploadedContract = await realContractService.uploadContract(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadedContract) {
        // Convert to Contract type with all required fields
        const contract: Contract = {
          id: uploadedContract.id,
          name: uploadedContract.name || file.name,
          mime_type: uploadedContract.mime_type || file.type,
          file_size: uploadedContract.file_size || file.size,
          upload_date: uploadedContract.created_at || new Date().toISOString(),
          created_at: uploadedContract.created_at || new Date().toISOString(),
          updated_at: uploadedContract.updated_at || new Date().toISOString(),
          content: uploadedContract.content || '',
          analysis_status: uploadedContract.analysis_status || 'completed',
          extraction_status: 'completed',
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
        throw new Error('Upload failed: No contract data received');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to upload contract';
      setError(errorMessage);
      toast.error('Upload failed', {
        description: errorMessage
      });
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  };

  // Select a contract for analysis
  const selectContract = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      setSelectedContract(contract);
      setError(null);
    } else {
      console.error('Contract not found with ID:', contractId);
      setError('Contract not found');
    }
  };

  // Analyze the selected contract
  const analyzeSelectedContract = async () => {
    if (!selectedContract) {
      return null;
    }
    
    try {
      setLoading(true);
      const analysis = await realContractService.analyzeContract(selectedContract.id);
      return analysis;
    } catch (error: any) {
      console.error('Analysis error:', error);
      setError('Failed to analyze contract: ' + error.message);
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
      setError('Failed to process question: ' + error.message);
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
