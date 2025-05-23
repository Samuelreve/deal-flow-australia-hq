
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        toast.error('You must be logged in to upload contracts');
        return null;
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload file');
        return null;
      }

      // Create contract record
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          analysis_status: 'pending'
        })
        .select()
        .single();

      if (contractError) {
        console.error('Contract creation error:', contractError);
        toast.error('Failed to create contract record');
        return null;
      }

      // Trigger text extraction
      this.extractText(contract.id, filePath);

      return contract as Contract;
    } catch (error) {
      console.error('Contract upload error:', error);
      toast.error('Failed to upload contract');
      return null;
    }
  }

  async extractText(contractId: string, filePath: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('text-extraction', {
        body: { contractId, filePath }
      });

      if (error) {
        console.error('Text extraction error:', error);
        await supabase
          .from('contracts')
          .update({ analysis_status: 'error' })
          .eq('id', contractId);
      }
    } catch (error) {
      console.error('Text extraction request error:', error);
    }
  }

  async getContract(contractId: string): Promise<Contract | null> {
    try {
      const { data: contract, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) {
        console.error('Get contract error:', error);
        return null;
      }

      return contract as Contract;
    } catch (error) {
      console.error('Get contract error:', error);
      return null;
    }
  }

  async getUserContracts(): Promise<Contract[]> {
    try {
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get contracts error:', error);
        return [];
      }

      return (contracts || []) as Contract[];
    } catch (error) {
      console.error('Get contracts error:', error);
      return [];
    }
  }

  async getContractQuestions(contractId: string): Promise<ContractQuestion[]> {
    try {
      const { data: questions, error } = await supabase
        .from('contract_questions')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get questions error:', error);
        return [];
      }

      return (questions || []).map(q => ({
        ...q,
        sources: Array.isArray(q.sources) ? q.sources : []
      })) as ContractQuestion[];
    } catch (error) {
      console.error('Get questions error:', error);
      return [];
    }
  }
}

export const realContractService = new RealContractService();
