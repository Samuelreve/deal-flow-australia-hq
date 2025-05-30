
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ContractUploadResult {
  id: string;
  name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  text_content?: string;
  content?: string;
  extraction_status: 'completed' | 'failed' | 'pending';
}

export interface Contract {
  id: string;
  name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  text_content?: string;
  content?: string;
  extraction_status: 'completed' | 'failed' | 'pending';
  analysis_status?: 'completed' | 'failed' | 'pending';
  file_path: string;
  user_id: string;
}

export interface QuestionResponse {
  answer: string;
  sources?: string[];
}

class RealContractService {
  async uploadContract(file: File): Promise<ContractUploadResult> {
    console.log('🚀 RealContractService.uploadContract started with file:', file.name);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('👤 User authenticated:', user.id);

      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `contracts/${user.id}/${fileName}`;

      console.log('📁 File path generated:', filePath);

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      console.log('✅ File uploaded to storage:', uploadData.path);

      // Extract text content based on file type
      let textContent = '';
      let extractionStatus: 'completed' | 'failed' | 'pending' = 'pending';

      try {
        if (file.type === 'text/plain') {
          textContent = await file.text();
          extractionStatus = 'completed';
          console.log('📄 Text file content extracted:', textContent.length, 'characters');
        } else {
          // For other file types, call text extraction service
          console.log('🔄 Calling text extraction service for:', file.type);
          
          const { data: extractionData, error: extractionError } = await supabase.functions
            .invoke('text-extraction', {
              body: {
                filePath: uploadData.path,
                fileName: file.name,
                mimeType: file.type
              }
            });

          if (extractionError) {
            console.error('⚠️ Text extraction failed:', extractionError);
            textContent = `Document "${file.name}" uploaded successfully but text extraction failed. The file is saved and can be downloaded.`;
            extractionStatus = 'failed';
          } else if (extractionData?.success) {
            textContent = extractionData.text || extractionData.fallbackText || '';
            extractionStatus = 'completed';
            console.log('✅ Text extracted via service:', textContent.length, 'characters');
          } else {
            textContent = `Document "${file.name}" uploaded successfully but text extraction is pending. Please try again.`;
            extractionStatus = 'failed';
          }
        }
      } catch (extractionError) {
        console.error('❌ Text extraction error:', extractionError);
        textContent = `Document "${file.name}" uploaded successfully. Text extraction requires manual processing.`;
        extractionStatus = 'failed';
      }

      // Insert contract record
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .insert({
          name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          user_id: user.id,
          text_content: textContent,
          content: textContent, // Fallback for compatibility
          extraction_status: extractionStatus,
          analysis_status: extractionStatus === 'completed' ? 'completed' : 'pending'
        })
        .select()
        .single();

      if (contractError) {
        console.error('❌ Database insert error:', contractError);
        throw new Error(`Failed to save contract: ${contractError.message}`);
      }

      console.log('✅ Contract saved to database:', contractData.id);

      return {
        id: contractData.id,
        name: contractData.name,
        file_size: contractData.file_size,
        mime_type: contractData.mime_type,
        created_at: contractData.created_at,
        text_content: contractData.text_content,
        content: contractData.content,
        extraction_status: contractData.extraction_status as 'completed' | 'failed' | 'pending'
      };

    } catch (error) {
      console.error('❌ RealContractService error:', error);
      throw error;
    }
  }

  async getContract(contractId: string): Promise<ContractUploadResult | null> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) {
        console.error('Error fetching contract:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        file_size: data.file_size,
        mime_type: data.mime_type,
        created_at: data.created_at,
        text_content: data.text_content,
        content: data.content,
        extraction_status: data.extraction_status as 'completed' | 'failed' | 'pending'
      };
    } catch (error) {
      console.error('Error in getContract:', error);
      return null;
    }
  }

  async getUserContracts(): Promise<Contract[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user contracts:', error);
        throw error;
      }

      return data.map(contract => ({
        id: contract.id,
        name: contract.name,
        file_size: contract.file_size,
        mime_type: contract.mime_type,
        created_at: contract.created_at,
        text_content: contract.text_content,
        content: contract.content,
        extraction_status: contract.extraction_status as 'completed' | 'failed' | 'pending',
        analysis_status: contract.analysis_status as 'completed' | 'failed' | 'pending',
        file_path: contract.file_path,
        user_id: contract.user_id
      }));
    } catch (error) {
      console.error('Error in getUserContracts:', error);
      throw error;
    }
  }

  async analyzeContract(contractId: string): Promise<any> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      // Placeholder analysis - in a real implementation, this would call an AI service
      return {
        summary: 'Contract analysis complete',
        key_terms: ['Payment terms', 'Delivery schedule', 'Termination clauses'],
        risks: ['Limited liability clauses', 'Force majeure provisions'],
        recommendations: ['Review payment terms', 'Consider additional warranties']
      };
    } catch (error) {
      console.error('Error analyzing contract:', error);
      throw error;
    }
  }

  async askQuestion(contractId: string, question: string): Promise<QuestionResponse> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract || !contract.text_content) {
        throw new Error('Contract not found or text not available');
      }

      // Call the contract assistant edge function
      const { data, error } = await supabase.functions.invoke('contract-assistant', {
        body: {
          question: question,
          contractText: contract.text_content,
          contractId: contractId
        }
      });

      if (error) {
        console.error('Contract assistant error:', error);
        throw new Error('Failed to process question with AI service');
      }

      return {
        answer: data.answer || 'No response received',
        sources: data.sources || []
      };
    } catch (error) {
      console.error('Error asking question:', error);
      throw error;
    }
  }
}

export const realContractService = new RealContractService();
