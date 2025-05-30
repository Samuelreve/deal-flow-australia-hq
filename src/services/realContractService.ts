import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Contract {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  content: string | null;
  text_content: string | null;
  upload_date: string;
  analysis_status: 'pending' | 'processing' | 'completed' | 'error';
  extraction_status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

export interface ContractQuestion {
  id: string;
  contract_id: string;
  question: string;
  answer: string;
  sources: string[];
  created_at: string;
}

class RealContractService {
  async uploadContract(file: File): Promise<Contract | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Authentication required', {
          description: 'You must be logged in to upload contracts'
        });
        return null;
      }

      // Validate file type with enhanced support
      const supportedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
        'text/plain',
        'application/rtf',
        'text/rtf'
      ];

      if (!supportedTypes.includes(file.type)) {
        toast.error('Unsupported file type', {
          description: 'Please upload a PDF, Word document (.docx/.doc), RTF, or text file'
        });
        return null;
      }

      // Check file size (increased limit to 25MB for enhanced file types)
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (file.size > maxSize) {
        toast.error('File too large', {
          description: 'Please upload a file smaller than 25MB'
        });
        return null;
      }

      // Generate unique file path with user folder structure for RLS
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log(`Uploading ${file.type} file: ${file.name} (${file.size} bytes)`);

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Upload failed', {
          description: 'Failed to upload file to storage'
        });
        return null;
      }

      console.log('File uploaded successfully to:', filePath);

      // Create contract record with processing extraction status
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          analysis_status: 'pending',
          extraction_status: 'processing'
        })
        .select()
        .single();

      if (contractError) {
        console.error('Contract creation error:', contractError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('contracts').remove([filePath]);
        toast.error('Database error', {
          description: 'Failed to create contract record'
        });
        return null;
      }

      console.log('Contract record created:', contract.id);

      // Process text extraction based on file type
      toast.info('Processing document', {
        description: 'Extracting text from your contract...'
      });

      let extractedText = '';
      let extractionStatus: 'completed' | 'error' = 'completed';

      try {
        if (file.type === 'text/plain' || file.type === 'application/rtf' || file.type === 'text/rtf') {
          // Handle text files directly on client
          extractedText = await file.text();
          console.log(`Text file processed: ${extractedText.length} characters`);
        } else {
          // For PDF and Word files, call the enhanced text extraction service
          console.log('Calling text extraction service for:', file.type);
          
          const { data: extractionData, error: extractionError } = await supabase.functions.invoke('text-extraction', {
            body: {
              filePath: filePath,
              fileName: file.name,
              mimeType: file.type
            }
          });

          if (extractionError) {
            console.error('Text extraction service error:', extractionError);
            extractionStatus = 'error';
            extractedText = `Text extraction service error for ${file.type} file: ${extractionError.message}. File uploaded successfully but text analysis may be limited.`;
          } else if (!extractionData?.success) {
            console.error('Text extraction failed:', extractionData?.error);
            extractionStatus = 'error';
            // Use fallback text if provided
            extractedText = extractionData?.fallbackText || `Text extraction failed for ${file.type} file. File uploaded successfully but text analysis is limited. Try uploading a text file for immediate processing.`;
          } else {
            extractedText = extractionData.text || '';
            console.log(`Advanced extraction successful: ${extractedText.length} characters`);
          }
        }

        // Update contract with extracted text
        const { error: updateError } = await supabase
          .from('contracts')
          .update({ 
            text_content: extractedText,
            extraction_status: extractionStatus,
            analysis_status: extractionStatus === 'completed' ? 'completed' : 'error'
          })
          .eq('id', contract.id);

        if (updateError) {
          console.error('Failed to update contract with extracted text:', updateError);
        }

        // Show appropriate success message
        if (extractionStatus === 'completed') {
          toast.success('Contract uploaded and processed successfully!', {
            description: `Text extracted (${extractedText.length} characters) and ready for AI analysis`
          });
        } else {
          toast.warning('Contract uploaded with limited functionality', {
            description: 'File saved but text extraction had issues. Some AI features may be limited.'
          });
        }
        
        // Return updated contract
        return {
          ...contract,
          text_content: extractedText,
          extraction_status: extractionStatus,
          analysis_status: extractionStatus === 'completed' ? 'completed' : 'error'
        } as Contract;
        
      } catch (extractionError) {
        console.error('Text extraction error:', extractionError);
        
        // Update contract status to error but keep file
        const fallbackText = `Text extraction failed: ${extractionError instanceof Error ? extractionError.message : 'Unknown error'}. File "${file.name}" is saved but text analysis features are limited.`;
        
        await supabase
          .from('contracts')
          .update({ 
            extraction_status: 'error',
            analysis_status: 'error',
            text_content: fallbackText
          })
          .eq('id', contract.id);

        toast.error('Text extraction failed', {
          description: 'File uploaded but text extraction encountered an error'
        });
        
        return {
          ...contract,
          text_content: fallbackText,
          extraction_status: 'error',
          analysis_status: 'error'
        } as Contract;
      }
      
    } catch (error) {
      console.error('Contract upload error:', error);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
      return null;
    }
  }

  async getContract(contractId: string): Promise<Contract | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Authentication required');
        return null;
      }

      const { data: contract, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Get contract error:', error);
        if (error.code === 'PGRST116') {
          toast.error('Contract not found');
        } else {
          toast.error('Failed to load contract');
        }
        return null;
      }

      return contract as Contract;
    } catch (error) {
      console.error('Get contract error:', error);
      toast.error('Failed to load contract');
      return null;
    }
  }

  async getUserContracts(): Promise<Contract[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get contracts error:', error);
        toast.error('Failed to load contracts');
        return [];
      }

      return (contracts || []) as Contract[];
    } catch (error) {
      console.error('Get contracts error:', error);
      return [];
    }
  }

  async askQuestion(contractId: string, question: string): Promise<{ answer: string; sources?: string[] } | null> {
    try {
      // Get the contract content
      const contract = await this.getContract(contractId);
      if (!contract || (!contract.text_content && !contract.content)) {
        toast.error('Contract unavailable', {
          description: 'Contract content not available for analysis'
        });
        return null;
      }

      if (contract.extraction_status === 'error' && contract.analysis_status === 'error') {
        toast.error('Contract analysis error', {
          description: 'This contract has extraction errors and cannot be queried'
        });
        return null;
      }

      // Show processing indicator
      toast.info('Processing question', {
        description: 'Analyzing your question...'
      });

      // Use text_content if available, fallback to content
      const contractContent = contract.text_content || contract.content || '';

      // Call the document AI assistant with real content
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'explain_clause',
          content: question,
          context: {
            contractContent: contractContent,
            contractId: contractId
          },
          dealId: 'contract-analysis',
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) {
        console.error('AI question error:', error);
        toast.error('AI processing failed', {
          description: 'Failed to get AI response for your question'
        });
        return null;
      }

      const answer = data.explanation || data.answer || 'No response received from AI service';

      // Save the question and answer
      try {
        await supabase
          .from('contract_questions')
          .insert({
            contract_id: contractId,
            question: question,
            answer: answer,
            sources: data.sources || [],
            user_id: (await supabase.auth.getUser()).data.user?.id
          });
      } catch (saveError) {
        console.warn('Failed to save question history:', saveError);
        // Don't fail the main operation if history saving fails
      }

      return {
        answer,
        sources: data.sources || []
      };
    } catch (error) {
      console.error('Ask question error:', error);
      toast.error('Question processing failed', {
        description: error instanceof Error ? error.message : 'Failed to process question'
      });
      return null;
    }
  }

  async analyzeContract(contractId: string): Promise<any> {
    try {
      // Get the contract content
      const contract = await this.getContract(contractId);
      if (!contract || (!contract.text_content && !contract.content)) {
        toast.error('Contract content not available for analysis');
        return null;
      }

      // Use text_content if available, fallback to content
      const contractContent = contract.text_content || contract.content || '';

      // Call the document AI assistant for analysis
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'summarize_document',
          dealId: 'contract-analysis',
          documentId: contractId,
          documentVersionId: 'latest',
          content: contractContent,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) {
        console.error('AI analysis error:', error);
        toast.error('Failed to analyze contract');
        return null;
      }

      // Save the analysis result
      await supabase
        .from('contract_summaries')
        .upsert({
          contract_id: contractId,
          summary_data: {
            summary: data.summary,
            documentType: data.documentType,
            analysisDate: new Date().toISOString()
          }
        });

      return data;
    } catch (error) {
      console.error('Analyze contract error:', error);
      toast.error('Failed to analyze contract');
      return null;
    }
  }

  async getContractQuestions(contractId: string): Promise<ContractQuestion[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data: questions, error } = await supabase
        .from('contract_questions')
        .select('*')
        .eq('contract_id', contractId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Get contract questions error:', error);
        return [];
      }

      return (questions || []) as ContractQuestion[];
    } catch (error) {
      console.error('Get contract questions error:', error);
      return [];
    }
  }
}

export const realContractService = new RealContractService();
