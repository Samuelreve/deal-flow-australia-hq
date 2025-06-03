
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

  console.log('🔧 useRealContracts state:', {
    user: user?.id,
    contractsCount: contracts.length,
    selectedContract: selectedContract?.id,
    loading,
    uploading
  });

  // Load user contracts
  const loadContracts = async () => {
    if (!user) {
      console.log('❌ No user, cannot load contracts');
      return;
    }
    
    try {
      console.log('📥 Loading contracts for user:', user.id);
      setLoading(true);
      const userContracts = await realContractService.getUserContracts();
      console.log('✅ Loaded contracts:', userContracts.length);
      setContracts(userContracts);
    } catch (error: any) {
      console.error('❌ Failed to load contracts:', error);
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

    console.log('🚀 Starting contract upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: user.id
    });

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 15;
          console.log('📈 Upload progress:', newProgress + '%');
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      console.log('📤 Calling realContractService.uploadContract...');
      const uploadedContract = await realContractService.uploadContract(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('📋 Upload response:', {
        success: !!uploadedContract,
        contractId: uploadedContract?.id,
        contentLength: uploadedContract?.content?.length || 0
      });

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
        
        console.log('✅ Created contract object:', {
          id: contract.id,
          name: contract.name,
          contentLength: contract.content.length
        });
        
        // Add to contracts list
        setContracts(prev => {
          const newContracts = [contract, ...prev];
          console.log('📝 Updated contracts list, new count:', newContracts.length);
          return newContracts;
        });
        
        // Auto-select the uploaded contract
        console.log('🎯 Auto-selecting uploaded contract');
        setSelectedContract(contract);
        
        toast.success('Contract uploaded and analyzed successfully!', {
          description: 'You can now ask questions about this contract.'
        });
        
        return contract;
      } else {
        console.error('❌ Upload failed: No contract returned from service');
        throw new Error('Upload failed: No contract data received');
      }
    } catch (error: any) {
      console.error('❌ Upload error details:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
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
  };

  // Analyze the selected contract
  const analyzeSelectedContract = async () => {
    if (!selectedContract) {
      console.log('❌ No contract selected for analysis');
      return null;
    }
    
    try {
      console.log('🔍 Analyzing contract:', selectedContract.id);
      setLoading(true);
      const analysis = await realContractService.analyzeContract(selectedContract.id);
      console.log('✅ Analysis completed');
      return analysis;
    } catch (error: any) {
      console.error('❌ Analysis error:', error);
      setError('Failed to analyze contract: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Ask a question about the selected contract
  const askQuestion = async (question: string) => {
    if (!selectedContract) {
      console.log('❌ No contract selected for question');
      toast.error('No contract selected');
      return null;
    }

    console.log('❓ Asking question about contract:', {
      contractId: selectedContract.id,
      question: question.substring(0, 50) + '...'
    });

    try {
      setLoading(true);
      const response = await realContractService.askQuestion(selectedContract.id, question);
      console.log('✅ Question answered');
      return response;
    } catch (error: any) {
      console.error('❌ Question error:', error);
      setError('Failed to process question: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load contracts when user changes
  useEffect(() => {
    if (user) {
      console.log('👤 User available, loading contracts');
      loadContracts();
    } else {
      console.log('👤 No user, clearing contracts');
      setContracts([]);
      setSelectedContract(null);
    }
  }, [user]);

  // Debug effect for state changes
  useEffect(() => {
    console.log('🔄 useRealContracts state changed:', {
      contractsCount: contracts.length,
      selectedContractId: selectedContract?.id,
      selectedContractContentLength: selectedContract?.content?.length || 0,
      loading,
      uploading,
      error
    });
  }, [contracts.length, selectedContract?.id, loading, uploading, error]);

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
