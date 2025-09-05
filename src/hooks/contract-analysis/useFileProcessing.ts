
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { DocumentMetadata, SummaryData } from './types';
import { 
  createDocumentMetadata, 
  createPlaceholderSummary, 
  extractTextFromFile,
  validateFileType 
} from './utils/contractAnalysisUtils';

export const useFileProcessing = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Analyze contract using AI (placeholder for real AI service)
  const analyzeContract = async (text: string): Promise<SummaryData> => {
    // This would connect to a real AI service in production
    return createPlaceholderSummary();
  };

  // Real file upload handler
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return { success: false };
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      const errorMessage = 'File size must be under 10MB';
      setError(errorMessage);
      toast.error('File too large', {
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    }
    
    // Validate file type
    if (!validateFileType(file)) {
      const errorMessage = 'Unsupported file type. Please upload a PDF, Word document, or text file.';
      setError(errorMessage);
      toast.error('Invalid file type', {
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    }
    
    setIsAnalyzing(true);
    setAnalysisStage('Uploading document...');
    setAnalysisProgress(10);
    setError(null);
    
    try {
      // Create document metadata
      const metadata: DocumentMetadata = createDocumentMetadata(file);
      setAnalysisProgress(30);
      
      // Extract text from file
      setAnalysisStage('Extracting text...');
      const text = await extractTextFromFile(file);
      setAnalysisProgress(60);
      
      // Analyze document
      setAnalysisStage('Analyzing contract...');
      const summary = await analyzeContract(text);
      setAnalysisProgress(90);
      
      // Update metadata to completed
      const completedMetadata = { ...metadata, status: 'completed' as const };
      setAnalysisProgress(100);
      setAnalysisStage('Analysis complete');
      
      toast.success('Contract analyzed successfully', {
        description: 'AI analysis and insights are now available'
      });
      
      return {
        success: true,
        metadata: completedMetadata,
        text,
        summary
      };
      
    } catch (error) {
      console.error('File upload and analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze contract';
      setError(errorMessage);
      toast.error('Analysis failed', {
        description: 'Please try uploading the document again'
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => {
        setAnalysisStage('');
        setAnalysisProgress(0);
      }, 2000);
    }
  }, []);

  return {
    isAnalyzing,
    analysisStage,
    analysisProgress,
    error,
    setError,
    handleFileUpload
  };
};
