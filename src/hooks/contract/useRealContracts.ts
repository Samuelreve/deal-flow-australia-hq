
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DocumentTextExtractionService } from '@/services/documentTextExtraction';

export interface Contract {
  id: string;
  name: string;
  content?: string;
  mime_type: string;
  file_size: number;
  upload_date: string;
  created_at: string;
  updated_at: string;
  analysis_status: string;
  extraction_status?: string;
  file_path: string;
  user_id: string;
}

export const useRealContracts = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  console.log('🔧 useRealContracts initialized:', {
    userId: user?.id,
    contractsCount: contracts.length,
    selectedContractId: selectedContract?.id
  });

  // Load contracts on mount
  useEffect(() => {
    if (user) {
      loadContracts();
    }
  }, [user]);

  const loadContracts = useCallback(async () => {
    if (!user) return;

    console.log('📥 Loading contracts for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Error loading contracts:', fetchError);
        throw fetchError;
      }

      console.log('✅ Contracts loaded:', data?.length || 0);
      setContracts(data || []);
    } catch (error) {
      console.error('❌ Failed to load contracts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const uploadContract = useCallback(async (file: File): Promise<Contract | null> => {
    if (!user) {
      console.error('❌ No user for upload');
      toast.error('Please log in to upload contracts');
      return null;
    }

    console.log('🚀 Starting contract upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: user.id
    });

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Create contract record with all required fields
      console.log('📝 Creating contract record...');
      setUploadProgress(20);

      const { data: contractData, error: createError } = await supabase
        .from('contracts')
        .insert({
          name: file.name,
          user_id: user.id,
          analysis_status: 'pending',
          mime_type: file.type,
          file_size: file.size,
          file_path: '', // Empty for now, will be updated if needed
          extraction_status: 'pending'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating contract:', createError);
        throw createError;
      }

      console.log('✅ Contract record created:', contractData.id);
      setUploadProgress(40);

      // Step 2: Extract text from file
      console.log('🔍 Extracting text from file...');
      const extractionResult = await DocumentTextExtractionService.extractTextFromFile(file);
      
      console.log('📄 Text extraction result:', {
        success: extractionResult.success,
        textLength: extractionResult.text?.length || 0,
        error: extractionResult.error,
        textPreview: extractionResult.text?.substring(0, 200) || 'NO TEXT'
      });

      if (!extractionResult.success) {
        console.error('❌ Text extraction failed:', extractionResult.error);
        throw new Error(extractionResult.error || 'Failed to extract text from file');
      }

      setUploadProgress(70);

      // Step 3: Update contract with extracted text
      console.log('💾 Saving extracted text to contract...');
      const { error: updateError } = await supabase
        .from('contracts')
        .update({
          content: extractionResult.text,
          analysis_status: 'completed',
          extraction_status: 'completed'
        })
        .eq('id', contractData.id);

      if (updateError) {
        console.error('❌ Error updating contract with text:', updateError);
        throw updateError;
      }

      console.log('✅ Contract updated with text content');
      setUploadProgress(90);

      // Create the final contract object
      const finalContract: Contract = {
        ...contractData,
        content: extractionResult.text,
        analysis_status: 'completed',
        extraction_status: 'completed'
      };

      console.log('🎯 Final contract object:', {
        id: finalContract.id,
        name: finalContract.name,
        contentLength: finalContract.content?.length || 0,
        hasContent: !!finalContract.content
      });

      // Update state
      setContracts(prev => [finalContract, ...prev]);
      setSelectedContract(finalContract);
      setUploadProgress(100);

      console.log('✅ Upload completed successfully');
      return finalContract;

    } catch (error) {
      console.error('❌ Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      toast.error('Upload failed: ' + errorMessage);
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }, [user]);

  const selectContract = useCallback((contractId: string) => {
    console.log('🎯 Selecting contract:', contractId);
    
    if (!contractId) {
      setSelectedContract(null);
      return;
    }

    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      console.log('✅ Contract selected:', {
        id: contract.id,
        name: contract.name,
        contentLength: contract.content?.length || 0
      });
      setSelectedContract(contract);
    } else {
      console.error('❌ Contract not found:', contractId);
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
    loadContracts
  };
};
