
import { useAnalysisTypes } from './useAnalysisTypes';
import { useAnalysisExecution } from './useAnalysisExecution';
import { useAnalysisHistory } from './useAnalysisHistory';
import { AnalysisRequest } from './types';

interface UseDocumentAnalysisProps {
  dealId: string;
  documentId?: string;
  versionId?: string;
}

export const useDocumentAnalysis = ({ dealId, documentId, versionId }: UseDocumentAnalysisProps) => {
  const analysisTypes = useAnalysisTypes();
  const analysisExecution = useAnalysisExecution(dealId);
  const analysisHistory = useAnalysisHistory(documentId, versionId);

  const runAnalysis = async (analysisType: string, saveToHistory = true) => {
    if (!documentId || !versionId) {
      throw new Error('Document ID and version ID are required for analysis');
    }

    const request: AnalysisRequest = {
      documentId,
      versionId,
      analysisType,
      dealId,
      saveToHistory
    };

    const result = await analysisExecution.executeAnalysis(request);
    
    if (result && saveToHistory) {
      // Refresh history after successful analysis
      analysisHistory.refreshHistory();
    }

    return result;
  };

  return {
    // Analysis types
    ...analysisTypes,
    
    // Execution
    ...analysisExecution,
    runAnalysis,
    
    // History
    ...analysisHistory,
  };
};
