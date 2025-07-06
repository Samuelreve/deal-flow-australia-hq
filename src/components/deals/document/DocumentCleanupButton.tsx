import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { documentCleanupService } from "@/services/documents/documentCleanupService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface DocumentCleanupButtonProps {
  dealId: string;
  onCleanupComplete?: () => void;
}

const DocumentCleanupButton: React.FC<DocumentCleanupButtonProps> = ({ 
  dealId, 
  onCleanupComplete 
}) => {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { toast } = useToast();

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    
    try {
      await documentCleanupService.deleteAllDocumentsForDeal(dealId);
      
      toast({
        title: "Cleanup Complete",
        description: "All documents have been deleted and storage cleaned up.",
      });
      
      onCleanupComplete?.();
    } catch (error: any) {
      console.error('Cleanup error:', error);
      toast({
        title: "Cleanup Failed",
        description: error.message || "Failed to clean up documents",
        variant: "destructive",
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isCleaningUp}>
          {isCleaningUp ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cleaning...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Clean Up All Documents
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete All Documents</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all documents, versions, comments, and analyses for this deal. 
            This action cannot be undone and will clean up storage inconsistencies.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleCleanup} className="bg-destructive hover:bg-destructive/90">
            Delete All Documents
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DocumentCleanupButton;