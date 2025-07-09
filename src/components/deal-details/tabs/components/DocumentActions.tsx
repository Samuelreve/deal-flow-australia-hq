import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Key, AlertTriangle } from "lucide-react";

interface DocumentActionsProps {
  onAnalyzeDocument: (type: 'summary' | 'key_terms' | 'risks') => void;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  onAnalyzeDocument,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1 justify-center sm:justify-start"
        onClick={() => onAnalyzeDocument('summary')}
      >
        <Eye className="h-4 w-4" />
        <span className="hidden sm:inline">Summarize</span>
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1 justify-center sm:justify-start"
        onClick={() => onAnalyzeDocument('key_terms')}
      >
        <Key className="h-4 w-4" />
        <span className="hidden sm:inline">Key Terms</span>
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1 justify-center sm:justify-start"
        onClick={() => onAnalyzeDocument('risks')}
      >
        <AlertTriangle className="h-4 w-4" />
        <span className="hidden sm:inline">Risks</span>
      </Button>
    </div>
  );
};

export default DocumentActions;