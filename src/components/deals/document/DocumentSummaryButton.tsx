
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useDocumentAI } from "@/hooks/useDocumentAI";
import { useToast } from "@/components/ui/use-toast";

export interface DocumentSummaryButtonProps {
  documentId: string;
  dealId: string;
  documentVersionId: string;
  userRole: string;
  className?: string;
}

const DocumentSummaryButton = ({ 
  documentId, 
  dealId,
  documentVersionId, 
  userRole,
  className = ""
}: DocumentSummaryButtonProps) => {
  const [summarizing, setSummarizing] = useState(false);
  // Fix: Remove versionId from the props as it's not in the expected type
  const { summarizeDocument } = useDocumentAI({ dealId, documentId });
  const { toast } = useToast();

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      // Fix: Pass documentId and documentVersionId as arguments to summarizeDocument
      const summary = await summarizeDocument(documentId, documentVersionId);
      if (summary) {
        toast({
          title: "Document analyzed",
          description: "Successfully created document summary",
        });
      }
    } catch (error) {
      console.error("Error summarizing document:", error);
      toast({
        title: "Summarization failed",
        description: "Failed to generate document summary",
        variant: "destructive",
      });
    } finally {
      setSummarizing(false);
    }
  };

  // Only certain roles should see this button
  if (!["admin", "seller", "lawyer"].includes(userRole?.toLowerCase())) {
    return null;
  }

  return (
    <Button
      onClick={handleSummarize}
      disabled={summarizing}
      variant="outline"
      size="sm"
      className={`flex items-center ${className}`}
    >
      {summarizing ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileText className="mr-2 h-4 w-4" />
      )}
      Summarize
    </Button>
  );
};

export default DocumentSummaryButton;
