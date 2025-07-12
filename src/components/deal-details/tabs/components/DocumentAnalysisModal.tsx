import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Eye, Key, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DocumentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisType: 'summary' | 'key_terms' | 'risks';
  result: any;
  documentName?: string;
}

const DocumentAnalysisModal: React.FC<DocumentAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysisType,
  result,
  documentName
}) => {
  const handleCopyToClipboard = () => {
    const textContent = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(textContent);
    toast("Copied to clipboard!");
  };

  const getIcon = () => {
    switch (analysisType) {
      case 'summary':
        return <Eye className="h-5 w-5" />;
      case 'key_terms':
        return <Key className="h-5 w-5" />;
      case 'risks':
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (analysisType) {
      case 'summary':
        return 'Document Summary';
      case 'key_terms':
        return 'Key Terms Analysis';
      case 'risks':
        return 'Risk Analysis';
    }
  };

  const formatContent = (content: any) => {
    if (!content) return "No analysis results available.";
    
    if (typeof content === 'string') {
      return content;
    }
    
    if (typeof content === 'object') {
      // If it's an object with specific structure, format it nicely
      if (content.summary) return content.summary;
      if (content.analysis) return content.analysis;
      if (content.result) return content.result;
      if (content.content) return content.content;
      
      // Otherwise, stringify with formatting
      return JSON.stringify(content, null, 2);
    }
    
    return String(content);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
            {documentName && <span className="text-muted-foreground">- {documentName}</span>}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy to Clipboard
            </Button>
          </div>
          
          <ScrollArea className="flex-1 rounded-md border p-4">
            <div className="whitespace-pre-wrap font-mono text-sm">
              {formatContent(result)}
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentAnalysisModal;
