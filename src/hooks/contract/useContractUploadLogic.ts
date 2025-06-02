
import { useCallback } from 'react';
import { realContractService, Contract } from '@/services/realContractService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface UseContractUploadLogicProps {
  contracts: Contract[];
  updateContracts: (contracts: Contract[]) => void;
  selectContract: (contractId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useContractUploadLogic = ({
  contracts,
  updateContracts,
  selectContract,
  setLoading,
  setError
}: UseContractUploadLogicProps) => {
  const { user } = useAuth();

  const uploadContract = useCallback(async (file: File): Promise<Contract | null> => {
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
      setLoading(true);
      setError(null);

      console.log('📤 Calling realContractService.uploadContract...');
      const uploadedContract = await realContractService.uploadContract(file);

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
        const newContracts = [contract, ...contracts];
        updateContracts(newContracts);
        
        // Auto-select the uploaded contract
        console.log('🎯 Auto-selecting uploaded contract');
        selectContract(contract.id);
        
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
      setLoading(false);
    }
  }, [user, contracts, updateContracts, selectContract, setLoading, setError]);

  return {
    uploadContract
  };
};
