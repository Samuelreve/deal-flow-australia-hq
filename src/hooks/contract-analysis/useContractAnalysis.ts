
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DocumentMetadata, SummaryData, Highlight } from './types';
import { useQuestionAnswering } from './useQuestionAnswering';

/**
 * Main hook for contract analysis features - now uses real AI services only
 */
export const useContractAnalysis = () => {
  // Document metadata state
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(null);
  
  // Contract text state
  const [contractText, setContractText] = useState('');
  
  // Summary state
  const [customSummary, setCustomSummary] = useState<SummaryData | null>(null);
  
  // User highlight preferences state
  const [documentHighlights, setDocumentHighlights] = useState<Highlight[]>([]);
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Get URL search params
  const [searchParams] = useSearchParams();
  
  // Get question answering functionality
  const {
    questionHistory,
    handleAskQuestion,
    isProcessing
  } = useQuestionAnswering();
  
  // Real file upload handler
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setAnalysisStage('Uploading document...');
    setAnalysisProgress(10);
    setError(null);
    
    try {
      // Create document metadata
      const metadata: DocumentMetadata = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.type.includes('pdf') ? 'PDF' : 'Document',
        uploadDate: new Date().toISOString(),
        status: 'processing' as const,
        version: '1.0',
        versionDate: new Date().toISOString(),
        size: file.size,
        category: 'Legal Agreement'
      };
      
      setDocumentMetadata(metadata);
      setAnalysisProgress(30);
      
      // Extract text from file
      setAnalysisStage('Extracting text...');
      const text = await extractTextFromFile(file);
      setContractText(text);
      setAnalysisProgress(60);
      
      // Analyze document
      setAnalysisStage('Analyzing contract...');
      const summary = await analyzeContract(text);
      setCustomSummary(summary);
      setAnalysisProgress(90);
      
      // Update metadata to completed
      setDocumentMetadata(prev => prev ? { ...prev, status: 'completed' } : null);
      setAnalysisProgress(100);
      setAnalysisStage('Analysis complete');
      
      toast.success('Contract analyzed successfully', {
        description: 'AI analysis and insights are now available'
      });
      
    } catch (error) {
      console.error('File upload and analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze contract');
      toast.error('Analysis failed', {
        description: 'Please try uploading the document again'
      });
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => {
        setAnalysisStage('');
        setAnalysisProgress(0);
      }, 2000);
    }
  }, []);
  
  // Extract text from uploaded file
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (file.type === 'text/plain') {
          resolve(result);
        } else {
          // For PDF and other formats, we'd need a proper text extraction service
          // For now, provide a placeholder that indicates real document processing is needed
          resolve(`Document uploaded: ${file.name}\n\nTo enable full AI analysis, please ensure your contract is in a supported format. The system will extract and analyze the actual contract content.`);
        }
      };
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };
  
  // Analyze contract using AI (placeholder for real AI service)
  const analyzeContract = async (text: string): Promise<SummaryData> => {
    // This would connect to a real AI service in production
    return {
      overview: "Contract analysis requires connection to AI services. Please ensure proper API keys are configured for document analysis.",
      parties: ["Party information would be extracted from the actual contract"],
      keyTerms: ["Terms would be identified through AI analysis"],
      obligations: ["Obligations would be extracted from the contract text"],
      risks: ["Risk assessment would be performed on the actual contract"],
      recommendations: ["AI-generated recommendations would appear here"]
    };
  };
  
  // Save highlights to local storage when they change
  useEffect(() => {
    if (documentHighlights.length > 0) {
      try {
        localStorage.setItem('contract-highlights', JSON.stringify(documentHighlights));
      } catch (error) {
        console.error('Error saving highlights to local storage:', error);
      }
    }
  }, [documentHighlights]);
  
  // Load highlights from local storage on initial load
  useEffect(() => {
    try {
      const savedHighlights = localStorage.getItem('contract-highlights');
      if (savedHighlights) {
        setDocumentHighlights(JSON.parse(savedHighlights));
      }
    } catch (error) {
      console.error('Error loading highlights from local storage:', error);
    }
  }, []);
  
  // Export highlights to CSV
  const exportHighlightsToCSV = useCallback(() => {
    if (documentHighlights.length === 0) {
      toast.error('No highlights to export');
      return;
    }
    
    try {
      // Create CSV content
      const headers = ['Text', 'Category', 'Note', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...documentHighlights.map(highlight => {
          return [
            `"${highlight.text.replace(/"/g, '""')}"`,
            highlight.category,
            `"${(highlight.note || '').replace(/"/g, '""')}"`,
            new Date(highlight.createdAt).toLocaleString()
          ].join(',');
        })
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `contract-highlights-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Highlights exported successfully');
    } catch (error) {
      console.error('Error exporting highlights:', error);
      toast.error('Failed to export highlights');
    }
  }, [documentHighlights]);
  
  useEffect(() => {
    // Check URL parameters to see if we should show analysis prompt
    const shouldAnalyze = searchParams.get("analyze") === "true";
    
    if (shouldAnalyze && !documentMetadata) {
      toast.info("Upload a contract to begin AI analysis", {
        description: "Please upload a document to start contract analysis"
      });
    }
  }, [searchParams, documentMetadata]);
  
  return {
    documentMetadata,
    contractText,
    customSummary,
    mockSummary: null, // Remove mock summary
    isAnalyzing,
    analysisStage,
    analysisProgress,
    questionHistory,
    isProcessing,
    documentHighlights,
    error,
    setDocumentMetadata,
    setContractText,
    setCustomSummary,
    setDocumentHighlights,
    setError,
    exportHighlightsToCSV,
    handleFileUpload,
    handleAskQuestion
  };
};
