
import { useState } from "react";
import { Document } from "@/types/deal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

/**
 * Base hook with common functionality for document operations
 */
export const useDocumentOperationsBase = (
  dealId: string,
  onDocumentsChange?: (documents: Document[]) => void
) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  
  /**
   * Helper to show success toast
   */
  const showSuccessToast = (title: string, description: string) => {
    toast({
      title,
      description,
    });
  };
  
  /**
   * Helper to show error toast
   */
  const showErrorToast = (error: any) => {
    console.error("Operation error:", error);
    toast({
      title: "Operation failed",
      description: error.message || "There was a problem with the operation.",
      variant: "destructive",
    });
  };

  return {
    user,
    dealId,
    uploading,
    setUploading,
    onDocumentsChange,
    showSuccessToast,
    showErrorToast
  };
};
