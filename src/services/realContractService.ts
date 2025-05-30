
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
        extraction_status: contractData.extraction_status
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

      return data;
    } catch (error) {
      console.error('Error in getContract:', error);
      return null;
    }
  }
}

export const realContractService = new RealContractService();
