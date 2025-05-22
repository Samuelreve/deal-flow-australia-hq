
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for managing document analysis results
 */
export const useAnalysisResultManagement = () => {
  const [saving, setSaving] = useState(false);
  
  /**
   * Save analysis result to the database for future reference
   */
  const saveAnalysisResult = async (
    documentId: string, 
    versionId: string, 
    analysisType: string,
    result: any
  ) => {
    setSaving(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to save analysis results');
      }
      
      // Save the analysis result to the database
      const { error } = await supabase
        .from('document_analysis_history')
        .insert({
          document_id: documentId,
          document_version_id: versionId,
          analysis_type: analysisType,
          result: result,
          created_by: user.id
        });
      
      if (error) {
        throw error;
      }
      
      toast.success('Analysis result saved for future reference');
      return true;
    } catch (err: any) {
      console.error('Error saving analysis result:', err);
      toast.error('Failed to save analysis result');
      return false;
    } finally {
      setSaving(false);
    }
  };
  
  return {
    saving,
    saveAnalysisResult
  };
};
