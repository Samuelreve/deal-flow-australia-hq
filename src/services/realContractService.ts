import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DocumentTextExtractionService } from './documentTextExtraction';

export interface Contract {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  content: string | null;
  upload_date: string;
  analysis_status: 'pending' | 'processing' | 'completed' | 'error';
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

      // Validate file type before processing
      if (!DocumentTextExtractionService.isSupportedFileType(file)) {
        const errorMessage = DocumentTextExtractionService.getUnsupportedFileTypeMessage(file);
        toast.error('Unsupported file type', {
          description: errorMessage
        });
        return null;
      }

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('File too large', {
          description: 'Please upload a file smaller than 10MB'
        });
        return null;
      }

      // Generate unique file path with user folder structure for RLS
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

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

      // Create contract record with pending status
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          analysis_status: 'processing'
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

      // Extract text from the uploaded file
      toast.info('Processing document', {
        description: 'Extracting text from your contract...'
      });

      const extractionResult = await DocumentTextExtractionService.extractAndStoreContractText(
        file, 
        contract.id
      );

      if (!extractionResult.success) {
        console.error('Text extraction failed:', extractionResult.error);
        
        // Update contract status to error
        await supabase
          .from('contracts')
          .update({ 
            analysis_status: 'error',
            content: `Text extraction failed: ${extractionResult.error}`
          })
          .eq('id', contract.id);

        toast.error('Text extraction failed', {
          description: extractionResult.error || 'Could not extract text from document'
        });
        return contract as Contract;
      }

      toast.success('Contract uploaded successfully!', {
        description: 'Text extracted and ready for analysis'
      });
      
      // Return updated contract with extracted content
      return {
        ...contract,
        content: extractionResult.text,
        analysis_status: 'completed'
      } as Contract;
      
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
      if (!contract || !contract.content) {
        toast.error('Contract unavailable', {
          description: 'Contract content not available for analysis'
        });
        return null;
      }

      if (contract.analysis_status === 'error') {
        toast.error('Contract analysis error', {
          description: 'This contract has analysis errors and cannot be queried'
        });
        return null;
      }

      // Show processing indicator
      toast.info('Processing question', {
        description: 'Analyzing your question...'
      });

      // Call the document AI assistant with real content
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'explain_clause',
          content: question,
          context: {
            contractContent: contract.content,
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
      if (!contract || !contract.content) {
        toast.error('Contract content not available for analysis');
        return null;
      }

      // Call the document AI assistant for analysis
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'summarize_document',
          dealId: 'contract-analysis',
          documentId: contractId,
          documentVersionId: 'latest',
          content: contract.content,
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
