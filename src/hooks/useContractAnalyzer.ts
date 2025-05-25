
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useContractAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const analyzeContract = async (text: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Calling analyze-contract function...');
      const { data, error } = await supabase.functions.invoke('analyze-contract', {
        body: { text }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to analyze contract');
      }

      if (data?.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }

      console.log('Contract analysis successful');
      setResult(data.result);
      return data.result;
    } catch (err: any) {
      console.error('Contract analysis failed:', err);
      const errorMessage = err.message || 'Failed to analyze contract';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeContract,
    loading,
    error,
    result,
    clearResult: () => setResult(null),
    clearError: () => setError(null)
  };
};
