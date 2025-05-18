
import { Document } from "@/types/deal";
import { Button } from "@/components/ui/button";

interface DocumentVersionHeaderProps {
  document: Document;
  onBack: () => void;
}

const DocumentVersionHeader = ({ document, onBack }: DocumentVersionHeaderProps) => {
  return (
    <div className="p-4 bg-white border-b">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{document.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {document.category || 'No description'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
        >
          Back to Documents
        </Button>
      </div>
    </div>
  );
};

export default DocumentVersionHeader;
