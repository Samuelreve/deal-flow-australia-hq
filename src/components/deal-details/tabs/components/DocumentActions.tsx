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
    <div className="flex gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1"
        onClick={() => onAnalyzeDocument('summary')}
      >
        <Eye className="h-4 w-4" />
        Summarize
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1"
        onClick={() => onAnalyzeDocument('key_terms')}
      >
        <Key className="h-4 w-4" />
        Key Terms
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1"
        onClick={() => onAnalyzeDocument('risks')}
      >
        <AlertTriangle className="h-4 w-4" />
        Risks
      </Button>
    </div>
  );
};

export default DocumentActions;