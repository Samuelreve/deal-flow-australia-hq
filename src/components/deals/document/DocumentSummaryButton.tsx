import React, { useState } from 'react';
import { useDocumentAI } from '@/hooks/useDocumentAI';
import { Document, DocumentVersion } from '@/types/documentVersion';
import { useToast } from "@/components/ui/use-toast";

interface DocumentSummaryButtonProps {
  document: Document;
  version?: DocumentVersion;
  onSummaryComplete?: (summary: any) => void;
}

const DocumentSummaryButton = ({ 
  document, 
  version,
  onSummaryComplete 
}: DocumentSummaryButtonProps) => {
  const { summarizeDocument } = useDocumentAI({ dealId: document.id, documentId: document.id });
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!document.id || !version?.id) {
      toast({
        title: "Error",
        description: "Cannot summarize: Missing document or version information",
        variant: "destructive"
      });
      return;
    }
    
    setIsSummarizing(true);
    try {
      // Fix: Pass only the 2 required arguments
      const result = await summarizeDocument(document.id, version.id);
      
      if (result) {
        toast({
          title: "Summary Generated",
          description: "Document summary has been created successfully"
        });
        
        if (onSummaryComplete) {
          onSummaryComplete(result);
        }
      }
    } catch (err: any) {
      console.error("Error generating document summary:", err);
      toast({
        title: "Summarization Failed",
        description: err.message || "There was an error generating the summary",
        variant: "destructive"
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <button
      onClick={handleSummarize}
      disabled={isSummarizing}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-secondary/50 bg-muted hover:bg-secondary h-9 px-4 py-2"
    >
      {isSummarizing ? (
        <>
          Summarizing...
          <svg className="animate-spin h-4 w-4 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </>
      ) : (
        "Summarize Document"
      )}
    </button>
  );
};

export default DocumentSummaryButton;
