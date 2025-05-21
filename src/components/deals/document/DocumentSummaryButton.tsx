import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useDocumentAI } from "@/hooks/useDocumentAI";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface DocumentSummaryButtonProps {
  dealId: string;
  documentId: string;
  documentVersionId: string;  // Updated prop name from versionId to documentVersionId
  userRole?: string;
  className?: string;
}

const DocumentSummaryButton: React.FC<DocumentSummaryButtonProps> = ({ 
  dealId, 
  documentId,
  documentVersionId,
  userRole = 'user',
  className = ''
}) => {
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { summarizeDocument, loading } = useDocumentAI({ dealId });
  
  // All participants can use the summary feature
  const canUseSummaryFeature = true;
  
  if (!canUseSummaryFeature) {
    return null;
  }
  
  const handleGenerateSummary = async () => {
    try {
      const result = await summarizeDocument('', documentId, documentVersionId);
      
      if (result?.summary) {
        setSummary(result.summary);
        setShowSummaryModal(true);
      } else {
        toast({
          title: "Summary Generation Failed",
          description: "Could not generate the document summary. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Document summary error:", error);
      toast({
        title: "Summary Generation Failed",
        description: error.message || "An error occurred while generating the summary.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        onClick={handleGenerateSummary}
        className={`gap-2 ${className}`}
        disabled={loading}
      >
        {loading ? <Spinner size="sm" /> : <FileText className="h-4 w-4" />}
        {loading ? 'Summarizing...' : 'Summarize'}
      </Button>
      
      <Dialog open={showSummaryModal} onOpenChange={setShowSummaryModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Document Summary</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="whitespace-pre-wrap text-sm">
              {summary}
            </div>
            
            <div className="text-xs text-muted-foreground border-t pt-2 mt-4">
              <p>This summary is AI-generated and provided for convenience only. It may not capture all details of the original document.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowSummaryModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentSummaryButton;
