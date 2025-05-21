
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Clock, Loader2 } from "lucide-react";
import { DocumentVersion } from "@/types/documentVersion";
import { useDocumentVersionManagement } from "@/hooks/useDocumentVersionManagement";

interface RestoreVersionButtonProps {
  version: DocumentVersion;
  dealId: string;
  documentId: string;
  onRestored: () => void;
}

const RestoreVersionButton = ({
  version,
  dealId,
  documentId,
  onRestored
}: RestoreVersionButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { restoring, restoreVersion } = useDocumentVersionManagement(dealId);
  
  const handleRestore = async () => {
    const result = await restoreVersion(version, documentId);
    if (result) {
      setDialogOpen(false);
      onRestored();
    }
  };
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="flex items-center gap-1"
      >
        <Clock className="h-4 w-4" />
        Restore Version
      </Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Document Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore version {version.versionNumber}? 
              This will create a new version based on this one and make it the latest.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={restoring}>
              Cancel
            </Button>
            <Button onClick={handleRestore} disabled={restoring}>
              {restoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Restore Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RestoreVersionButton;
