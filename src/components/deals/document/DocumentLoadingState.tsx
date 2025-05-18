
import { Loader2 } from "lucide-react";

const DocumentLoadingState = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading documents...</span>
    </div>
  );
};

export default DocumentLoadingState;
