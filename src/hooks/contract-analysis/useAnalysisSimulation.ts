
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { DocumentMetadata } from './types';

interface UseAnalysisSimulationProps {
  documentMetadata: DocumentMetadata;
  setDocumentMetadata: React.Dispatch<React.SetStateAction<DocumentMetadata>>;
  setContractText: React.Dispatch<React.SetStateAction<string>>;
  setCustomSummary: React.Dispatch<React.SetStateAction<any>>;
  mockSummaryData: any;
}

/**
 * Hook for simulating contract analysis process
 */
export const useAnalysisSimulation = ({
  documentMetadata,
  setDocumentMetadata,
  setContractText,
  setCustomSummary,
  mockSummaryData
}: UseAnalysisSimulationProps) => {
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('initializing');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Simulate different analysis stages with progress
  const simulateAnalysisStages = useCallback(() => {
    const stages = [
      { name: 'uploading', duration: 1000, progress: 20 },
      { name: 'processing', duration: 1500, progress: 40 },
      { name: 'analyzing', duration: 2000, progress: 70 },
      { name: 'summarizing', duration: 1500, progress: 90 },
      { name: 'complete', duration: 1000, progress: 100 }
    ];
    
    let currentStageIndex = 0;
    
    const processStage = () => {
      if (currentStageIndex >= stages.length) {
        // Analysis complete
        setIsAnalyzing(false);
        setDocumentMetadata(prev => ({ ...prev, status: 'Analyzed' }));
        
        // In a real app, we'd set the actual summary from AI here
        // For demo, we'll just use our mock summary
        setCustomSummary(mockSummaryData);
        return;
      }
      
      const currentStage = stages[currentStageIndex];
      setAnalysisStage(currentStage.name);
      setAnalysisProgress(currentStage.progress);
      
      // Process next stage after delay
      currentStageIndex++;
      setTimeout(processStage, currentStage.duration);
    };
    
    // Start processing
    processStage();
  }, [setDocumentMetadata, setCustomSummary, mockSummaryData]);

  // Mock file upload handler
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Update document metadata with new file info
    setDocumentMetadata({
      ...documentMetadata,
      name: file.name,
      type: file.type,
      uploadDate: new Date().toLocaleDateString(),
      status: 'Uploading',
    });
    
    // Simulate document analysis process
    setIsAnalyzing(true);
    setAnalysisStage('uploading');
    setAnalysisProgress(0);
    
    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Always use the actual file content when available
        const fileContent = event.target.result.toString();
        setContractText(fileContent);
        
        // Simulate processing stages with delays
        simulateAnalysisStages();
      }
    };
    
    reader.readAsText(file);
  }, [documentMetadata, setDocumentMetadata, setContractText, simulateAnalysisStages]);

  return {
    isAnalyzing,
    analysisStage,
    analysisProgress,
    handleFileUpload,
  };
};
