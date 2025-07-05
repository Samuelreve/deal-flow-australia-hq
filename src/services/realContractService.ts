import { supabase } from '@/integrations/supabase/client';

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

export interface UploadedContract {
  id: string;
  name?: string;
  content?: string;
  mime_type?: string;
  file_size?: number;
  created_at?: string;
  updated_at?: string;
  analysis_status?: string;
  extraction_status?: string;
  text_content?: string;
}

class RealContractService {
  // Get all contracts for the current user
  async getUserContracts(): Promise<Contract[]> {
    try {
      console.log('📥 RealContractService.getUserContracts called');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user');
        throw new Error('User not authenticated');
      }

      console.log('👤 Fetching contracts for user:', user.id);
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error:', error);
        throw new Error(`Failed to fetch contracts: ${error.message}`);
      }

      console.log('✅ Fetched contracts:', {
        count: data?.length || 0,
        contracts: data?.map(c => ({ id: c.id, name: c.name, contentLength: c.content?.length || 0 }))
      });

      return data || [];
    } catch (error) {
      console.error('❌ getUserContracts error:', error);
      throw error;
    }
  }

  // Upload a new contract
  async uploadContract(file: File): Promise<UploadedContract> {
    try {
      console.log('📤 RealContractService.uploadContract called:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user');
        throw new Error('User not authenticated');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      console.log('🤖 Calling public-ai-analyzer edge function...');

      // Get session to debug headers
      const { data: { session } } = await supabase.auth.getSession();
      console.log('📝 Session available:', !!session);
      console.log('📝 Session token length:', session?.access_token?.length || 0);

      // Call the public AI analyzer edge function
      const { data: response, error } = await supabase.functions.invoke('public-ai-analyzer', {
        body: formData
      });

      console.log('📤 Request debug:', {
        hasSession: !!session,
        tokenPresent: !!session?.access_token,
        functionName: 'public-ai-analyzer',
        hasError: !!error,
        hasData: !!response
      });

      if (error) {
        console.error('❌ Edge function error:', {
          errorMessage: error.message,
          errorDetails: error
        });
        
        throw new Error(`AI analysis failed: ${error.message || 'Unknown error'}`);
      }

      if (!response || !response.success) {
        console.error('❌ AI analysis failed:', response);
        throw new Error('AI analysis failed: No successful response');
      }

      console.log('✅ AI analysis successful:', {
        hasText: !!response.text,
        textLength: response.text?.length || 0,
        hasAnalysis: !!response.analysis,
        hasMetadata: !!response.metadata
      });

      // Clean the text to remove any null bytes or control characters
      const cleanedText = response.text ? 
        response.text
          .replace(/\x00/g, '') // Remove null bytes
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
          .trim() : '';

      console.log('🧹 Text cleaned for database storage:', {
        originalLength: response.text?.length || 0,
        cleanedLength: cleanedText.length,
        textPreview: cleanedText.substring(0, 200)
      });

      // Log the full extracted text data for debugging
      console.log('📄 FULL EXTRACTED TEXT DATA:');
      console.log('='.repeat(50));
      console.log(cleanedText);
      console.log('='.repeat(50));
      console.log(`Total characters: ${cleanedText.length}`);

      // Store the contract in the database
      const contractData = {
        name: file.name,
        mime_type: file.type,
        file_size: file.size,
        content: cleanedText,
        analysis_status: 'completed',
        extraction_status: 'completed',
        file_path: '',
        user_id: user.id
      };

      console.log('💾 Storing contract in database...');

      const { data: savedContract, error: dbError } = await supabase
        .from('contracts')
        .insert(contractData)
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database error:', dbError);
        throw new Error(`Failed to save contract: ${dbError.message}`);
      }

      console.log('✅ Contract saved to database:', {
        id: savedContract.id,
        name: savedContract.name,
        contentLength: savedContract.content?.length || 0
      });

      return {
        id: savedContract.id,
        name: savedContract.name,
        content: savedContract.content,
        mime_type: savedContract.mime_type,
        file_size: savedContract.file_size,
        created_at: savedContract.created_at,
        updated_at: savedContract.updated_at,
        analysis_status: savedContract.analysis_status,
        text_content: cleanedText
      };
    } catch (error) {
      console.error('❌ uploadContract error:', error);
      throw error;
    }
  }

  // Analyze a contract (if not already analyzed)
  async analyzeContract(contractId: string): Promise<any> {
    try {
      console.log('🔍 RealContractService.analyzeContract called:', contractId);

      const { data: contract, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw new Error(`Failed to fetch contract: ${error.message}`);
      }

      if (!contract) {
        throw new Error('Contract not found');
      }

      console.log('✅ Contract analysis returned:', {
        id: contract.id,
        analysisStatus: contract.analysis_status
      });

      // Return analysis data (for now, just return the contract)
      return {
        summary: 'Contract analysis completed',
        keyTerms: [],
        risks: []
      };
    } catch (error) {
      console.error('❌ analyzeContract error:', error);
      throw error;
    }
  }

  // Ask a question about a contract
  async askQuestion(contractId: string, question: string): Promise<any> {
    try {
      console.log('❓ RealContractService.askQuestion called:', {
        contractId,
        questionLength: question.length
      });

      // Get the contract content
      const { data: contract, error } = await supabase
        .from('contracts')
        .select('content')
        .eq('id', contractId)
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw new Error(`Failed to fetch contract: ${error.message}`);
      }

      if (!contract || !contract.content) {
        throw new Error('Contract content not found');
      }

      console.log('🤖 Calling contract-assistant edge function...');

      // Call the contract assistant edge function
      const { data, error: functionError } = await supabase.functions.invoke('contract-assistant', {
        body: {
          question,
          contractText: contract.content,
          contractId
        }
      });

      if (functionError) {
        console.error('❌ Edge function error:', functionError);
        throw new Error(`Question processing failed: ${functionError.message}`);
      }

      if (!data || !data.answer) {
        console.error('❌ No answer received:', data);
        throw new Error('No answer received from AI service');
      }

      console.log('✅ Question answered successfully');

      return {
        answer: data.answer,
        sources: data.sources || []
      };
    } catch (error) {
      console.error('❌ askQuestion error:', error);
      throw error;
    }
  }
}

export const realContractService = new RealContractService();
