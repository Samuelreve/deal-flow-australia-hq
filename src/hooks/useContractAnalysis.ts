
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Mock document metadata for demonstration
const mockDocumentMetadata = {
  name: 'Sample Contract.pdf',
  type: 'PDF Document',
  uploadDate: new Date().toLocaleDateString(),
  status: 'Analyzed',
  version: '1.0',
  versionDate: new Date().toLocaleDateString(),
};

// Mock summary data for demonstration
const mockSummaryData = {
  summary: [
    {
      title: 'Contract Overview',
      content: 'This is a non-disclosure agreement (NDA) between Company A and Company B, effective as of the date of signing.'
    },
    {
      title: 'Key Parties',
      content: 'Company A (Disclosing Party) and Company B (Receiving Party)'
    },
    {
      title: 'Term and Duration',
      content: 'The agreement is effective for 3 years from the date of signing, with automatic renewal unless terminated.'
    },
    {
      title: 'Confidentiality Obligations',
      content: 'The receiving party must protect the confidential information with the same degree of care as their own confidential information.'
    },
    {
      title: 'Termination Provisions',
      content: 'Either party may terminate this agreement with 30 days written notice.'
    }
  ],
  disclaimer: 'This AI-generated summary is for informational purposes only and should not be considered legal advice. Always consult a qualified legal professional before making decisions based on this information.'
};

// Sample contract text for demonstration
const sampleContractText = `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into between:

Company A, with its principal place of business at 123 Business Ave, City, State ("Disclosing Party")

and

Company B, with its principal place of business at 456 Corporate Blvd, Town, State ("Receiving Party")

WHEREAS, the Disclosing Party possesses certain ideas and information relating to [business purpose] that is confidential and proprietary to the Disclosing Party (hereinafter referred to as "Confidential Information"); and

WHEREAS, the Receiving Party is willing to receive disclosure of the Confidential Information for the purpose of [stated purpose] (the "Purpose").

NOW THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. Definition of Confidential Information
   For purposes of this Agreement, "Confidential Information" shall include all information or material that has or could have commercial value or other utility in the business in which the Disclosing Party is engaged.

2. Obligations of Receiving Party
   The Receiving Party shall hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the Disclosing Party.

3. Term
   This Agreement shall remain in effect for a period of 3 years from the date of signing.

4. Termination
   This Agreement may be terminated by either party with thirty (30) days written notice to the other party.

5. Governing Law
   This Agreement shall be governed by the laws of the State of [State].

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

Company A
By: ____________________
Name: _________________
Title: __________________

Company B
By: ____________________
Name: _________________
Title: __________________`;

/**
 * Custom hook for contract analysis features
 */
export const useContractAnalysis = () => {
  // Document metadata state
  const [documentMetadata, setDocumentMetadata] = useState(mockDocumentMetadata);
  
  // Contract text state
  const [contractText, setContractText] = useState(sampleContractText);
  
  // Summary state
  const [customSummary, setCustomSummary] = useState(null);
  const [mockSummary] = useState(mockSummaryData);
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('initializing');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Q&A state
  const [questionHistory, setQuestionHistory] = useState<Array<{question: string, answer: string}>>([]);
  
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
  }, [documentMetadata]);
  
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
  }, []);
  
  // Function to handle asking questions about the contract
  const handleAskQuestion = useCallback(async (question: string): Promise<{answer: string; sources?: string[]}> => {
    // In a real app, this would call an AI service with the question and contract text
    // For this demo, we'll simulate different responses based on keywords
    
    // Add a short delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let answer = '';
    const keywords = question.toLowerCase();
    
    // Match common questions with prepared answers
    if (keywords.includes('duration') || keywords.includes('term') || keywords.includes('how long')) {
      answer = "The agreement is effective for 3 years from the date of signing, as stated in Section 3 of the contract.";
    } 
    else if (keywords.includes('termination') || keywords.includes('cancel') || keywords.includes('end')) {
      answer = "According to Section 4, either party may terminate this agreement with thirty (30) days written notice to the other party.";
    }
    else if (keywords.includes('confidential') || keywords.includes('information') || keywords.includes('protect')) {
      answer = "The receiving party must hold and maintain the confidential information in strictest confidence for the sole and exclusive benefit of the disclosing party, as specified in Section 2.";
    }
    else if (keywords.includes('governing') || keywords.includes('law') || keywords.includes('jurisdiction')) {
      answer = "The agreement is governed by the laws of the State specified in Section 5 of the contract.";
    }
    else if (keywords.includes('parties') || keywords.includes('who')) {
      answer = "The parties in this agreement are Company A (the Disclosing Party) and Company B (the Receiving Party).";
    }
    else {
      // Generic response for questions we don't have a specific answer for
      answer = "Based on my analysis of the contract, I don't have specific information about this question. Please review the full contract text or consult a legal professional for more detailed information.";
    }
    
    // Add to question history
    setQuestionHistory(prev => [...prev, { question, answer }]);
    
    return { 
      answer,
      sources: ['Section 1-5, Non-Disclosure Agreement'] 
    };
  }, []);
  
  return {
    documentMetadata,
    contractText,
    customSummary,
    mockSummary,
    isAnalyzing,
    analysisStage,
    analysisProgress,
    questionHistory,
    handleFileUpload,
    handleAskQuestion
  };
};
