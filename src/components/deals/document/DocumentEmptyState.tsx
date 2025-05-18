
import { FileText } from "lucide-react";

const DocumentEmptyState = () => {
  return (
    <div className="text-center py-12 border rounded-lg bg-slate-50">
      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
      <h3 className="text-lg font-medium mb-1">No documents yet</h3>
      <p className="text-muted-foreground">
        Upload documents to share with deal participants
      </p>
    </div>
  );
};

export default DocumentEmptyState;
