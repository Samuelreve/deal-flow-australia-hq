import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';
import ContractPageHeader from '@/components/contract/ContractPageHeader';
import ContractSidebar from '@/components/contract/ContractSidebar';
import ContractMainContent from '@/components/contract/ContractMainContent';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useContractAnalysisState } from '@/hooks/contract/useContractAnalysisState';
import { useContractDocumentUpload } from '@/hooks/contract/useContractDocumentUpload';
import { useContractQuestionAnswer } from '@/hooks/contract/useContractQuestionAnswer';
import { mockSummaryData } from '@/hooks/contract-analysis/mockData';
import { DocumentMetadata } from '@/types/contract';

// Sample contract text for demo purposes
const SAMPLE_CONTRACT_TEXT = `
MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of June 1, 2023 (the "Effective Date") by and between Company A, located at 123 Business Ave, City, State ("Company A"), and Company B, located at 456 Corporate Blvd, Town, State ("Company B").

1. PURPOSE
The parties wish to explore a potential business opportunity of mutual interest and in connection with this opportunity, each party may disclose to the other certain confidential technical and business information that the disclosing party desires the receiving party to treat as confidential.

2. CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally or by inspection of tangible objects, which is designated as "Confidential," "Proprietary" or some similar designation, or information which by its nature would be understood by a reasonable person to be confidential or proprietary.

3. TERM
This Agreement shall remain in effect for a period of 3 years from the Effective Date. The confidentiality obligations set forth in this Agreement shall survive termination of this Agreement for a period of 5 years.

4. TERMINATION
Either party may terminate this Agreement upon thirty (30) days prior written notice to the other party. All sections of this Agreement relating to the rights and obligations of the parties concerning Confidential Information disclosed during the term of the Agreement shall survive any such termination.

5. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law principles. Any disputes arising out of or related to this Agreement shall be resolved in the courts of New York County, New York.

6. REMEDIES
The receiving party agrees that any violation or threatened violation of this Agreement may cause irreparable injury to the disclosing party, entitling the disclosing party to seek injunctive relief in addition to all legal remedies.

7. AMENDMENTS
This Agreement may not be amended except by a written agreement signed by authorized representatives of both parties.

8. INTELLECTUAL PROPERTY RIGHTS
Nothing in this Agreement is intended to grant any rights to either party under any patent, copyright, trade secret or other intellectual property right of the other party.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective Date.

COMPANY A                             COMPANY B
By: _________________                By: _________________
Name: John Smith                      Name: Jane Doe
Title: CEO                            Title: CTO
Date: June 1, 2023                    Date: June 1, 2023
`;

const DemoContractPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("summary");
  
  // Use our custom hooks
  const analysisState = useContractAnalysisState();
  const questionAnswerState = useContractQuestionAnswer();
  
  const uploadHandler = useContractDocumentUpload({
    onUploadSuccess: (metadata, text, summary) => {
      analysisState.setDocumentMetadata(metadata);
      analysisState.setContractText(text || SAMPLE_CONTRACT_TEXT);
      analysisState.setCustomSummary(summary);
    },
    onUploadError: (error) => {
      analysisState.setError(error);
    }
  });

  const exportHighlightsToCSV = () => {
    if (analysisState.documentHighlights.length === 0) {
      toast.error('No highlights to export');
      return;
    }
    
    try {
      const headers = ['Text', 'Category', 'Note', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...analysisState.documentHighlights.map(highlight => {
          return [
            `"${highlight.text.replace(/"/g, '""')}"`,
            highlight.category || '',
            `"${(highlight.note || '').replace(/"/g, '""')}"`,
            new Date(highlight.createdAt).toLocaleString()
          ].join(',');
        })
      ].join('\n');
      
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
  };
  
  useEffect(() => {
    const shouldAnalyze = searchParams.get("analyze") === "true";
    
    // Set sample contract text if no contract text is available
    if (!analysisState.contractText) {
      analysisState.setContractText(SAMPLE_CONTRACT_TEXT);
    }
    
    if (shouldAnalyze && !analysisState.isAnalyzing) {
      toast.success("Contract analyzed successfully", {
        description: "AI summary and insights are now available"
      });
    }
  }, [searchParams, analysisState]);
  
  return (
    <AppLayout>
      <div className="container py-6 max-w-5xl">
        <ContractPageHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Document Info and Upload */}
          <ErrorBoundary>
            <ContractSidebar
              documentMetadata={analysisState.documentMetadata}
              isAnalyzing={analysisState.isAnalyzing}
              documentHighlights={analysisState.documentHighlights}
              onFileUpload={uploadHandler.handleFileUpload}
              onExportHighlights={exportHighlightsToCSV}
            />
          </ErrorBoundary>
          
          {/* Main Column - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary>
              <ContractMainContent
                isAnalyzing={analysisState.isAnalyzing}
                analysisStage={analysisState.analysisProgress.stage}
                analysisProgress={analysisState.analysisProgress.progress}
                activeTab={activeTab}
                customSummary={analysisState.customSummary}
                mockSummary={mockSummaryData}
                contractText={analysisState.contractText}
                questionHistory={questionAnswerState.questionHistory}
                isProcessing={questionAnswerState.isProcessing}
                onTabChange={setActiveTab}
                onAskQuestion={questionAnswerState.handleAskQuestion}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DemoContractPage;
