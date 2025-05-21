
import { supabase } from "@/integrations/supabase/client";

export interface DocumentAnalysis {
  id: string;
  documentId: string;
  documentVersionId: string;
  analysisType: string;
  analysisContent: any;
  createdAt: string;
  createdBy?: string;
}

export interface SaveAnalysisParams {
  documentId: string;
  documentVersionId: string;
  analysisType: string;
  analysisContent: any;
}

/**
 * Service for managing document analyses
 */
export const documentAnalysisService = {
  /**
   * Save a document analysis result
   */
  async saveAnalysis(params: SaveAnalysisParams): Promise<DocumentAnalysis | null> {
    const { data, error } = await supabase
      .from('document_analyses')
      .insert({
        document_id: params.documentId,
        document_version_id: params.documentVersionId,
        analysis_type: params.analysisType,
        analysis_content: params.analysisContent,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select('*')
      .single();

    if (error) {
      console.error("Error saving document analysis:", error);
      throw error;
    }

    return data ? mapFromDb(data) : null;
  },

  /**
   * Get analysis history for a document
   */
  async getAnalysisHistory(documentId: string): Promise<DocumentAnalysis[]> {
    const { data, error } = await supabase
      .from('document_analyses')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching document analysis history:", error);
      throw error;
    }

    return data ? data.map(mapFromDb) : [];
  },

  /**
   * Get analysis history for a specific document version
   */
  async getVersionAnalysisHistory(documentVersionId: string): Promise<DocumentAnalysis[]> {
    const { data, error } = await supabase
      .from('document_analyses')
      .select('*')
      .eq('document_version_id', documentVersionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching document version analysis history:", error);
      throw error;
    }

    return data ? data.map(mapFromDb) : [];
  },

  /**
   * Get specific analysis by ID
   */
  async getAnalysisById(analysisId: string): Promise<DocumentAnalysis | null> {
    const { data, error } = await supabase
      .from('document_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (error) {
      console.error("Error fetching document analysis:", error);
      throw error;
    }

    return data ? mapFromDb(data) : null;
  }
};

// Helper to map from DB format to service format
function mapFromDb(dbAnalysis: any): DocumentAnalysis {
  return {
    id: dbAnalysis.id,
    documentId: dbAnalysis.document_id,
    documentVersionId: dbAnalysis.document_version_id,
    analysisType: dbAnalysis.analysis_type,
    analysisContent: dbAnalysis.analysis_content,
    createdAt: dbAnalysis.created_at,
    createdBy: dbAnalysis.created_by
  };
}
