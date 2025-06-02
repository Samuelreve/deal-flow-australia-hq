
import { supabase } from '@/integrations/supabase/client';

export interface ContractAnalysisRequest {
  contractId: string;
  question: string;
}

export interface ContractAnalysisResponse {
  answer: string;
  sources?: string[];
}

class ContractAnalysisService {
  async askQuestion(contractId: string, question: string): Promise<ContractAnalysisResponse> {
    try {
      console.log('🤖 ContractAnalysisService.askQuestion called:', {
        contractId,
        questionLength: question.length
      });

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

export const contractAnalysisService = new ContractAnalysisService();
