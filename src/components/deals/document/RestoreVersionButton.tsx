
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDocumentVersionManagement } from "@/hooks/useDocumentVersionManagement";
import { versionRestoreService } from "@/services/documents/version-management/versionRestoreService";
import { DocumentVersion } from "@/types/documentVersion";
import { Loader2 } from "lucide-react";

interface RestoreVersionButtonProps {
  version: DocumentVersion;
  dealId: string;
  onRestored?: () => void;
}

const RestoreVersionButton: React.FC<RestoreVersionButtonProps> = ({
  version,
  dealId,
  onRestored
}) => {
  const [restoring, setRestoring] = useState(false);
  const { toast } = useToast();

  const handleRestore = async () => {
    setRestoring(true);
    try {
      // Use the versionRestoreService directly
      await versionRestoreService.restoreVersion(version.id, version.documentId);
      
      toast({
        title: "Version Restored",
        description: `Version ${version.versionNumber} has been restored successfully.`
      });
      
      if (onRestored) {
        onRestored();
      }
    } catch (error: any) {
      console.error("Error restoring version:", error);
      toast({
        title: "Restore Failed",
        description: error.message || "Failed to restore document version",
        variant: "destructive"
      });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleRestore}
      disabled={restoring}
      className="flex items-center"
    >
      {restoring ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Restoring...
        </>
      ) : (
        <>Restore This Version</>
      )}
    </Button>
  );
};

export default RestoreVersionButton;
