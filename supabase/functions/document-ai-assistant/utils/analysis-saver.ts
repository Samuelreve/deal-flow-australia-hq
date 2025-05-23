
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

export async function saveAnalysisResult(
  documentId: string,
  documentVersionId: string,
  analysisType: string,
  analysisContent: any,
  userId: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    await supabase
      .from('document_analyses')
      .insert({
        document_id: documentId,
        document_version_id: documentVersionId,
        analysis_type: analysisType,
        analysis_content: analysisContent,
        created_by: userId
      });
  } catch (saveError) {
    console.error("Error saving analysis:", saveError);
    // Continue anyway to return analysis to user
  }
}
