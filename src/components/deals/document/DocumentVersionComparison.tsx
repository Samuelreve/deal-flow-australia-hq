
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentVersion } from "@/types/documentVersion";
import { versionComparisonService } from "@/services/documents/version-management/versionComparisonService";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface DocumentVersionComparisonProps {
  versions: DocumentVersion[];
  selectedVersionId: string;
  dealId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DocumentVersionComparison: React.FC<DocumentVersionComparisonProps> = ({
  versions,
  selectedVersionId,
  dealId,
  open = false,
  onOpenChange
}) => {
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const { toast } = useToast();

  // Find previous version for comparison
  const selectedVersionIndex = versions.findIndex(v => v.id === selectedVersionId);
  const hasPreviousVersion = selectedVersionIndex < versions.length - 1 && selectedVersionIndex !== -1;
  const previousVersion = hasPreviousVersion ? versions[selectedVersionIndex + 1] : null;

  const compareVersions = useCallback(async (currentVersionId: string) => {
    if (!previousVersion) return;
    
    setComparing(true);
    try {
      const result = await versionComparisonService.compareVersions(
        currentVersionId, 
        previousVersion.id,
        dealId
      );
      
      setComparisonResult(result);
    } catch (error: any) {
      console.error("Error comparing versions:", error);
      toast({
        title: "Comparison Failed",
        description: error.message || "Failed to compare document versions",
        variant: "destructive"
      });
    } finally {
      setComparing(false);
    }
  }, [previousVersion, toast, dealId]);

  if (!open) {
    return null;
  }

  if (!hasPreviousVersion) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Version Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <p className="mb-2">
            Compare with previous version ({previousVersion?.versionNumber})
          </p>
          <Button
            size="sm"
            onClick={() => compareVersions(selectedVersionId)}
            disabled={comparing}
          >
            {comparing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Comparing...
              </>
            ) : (
              "Compare Versions"
            )}
          </Button>

          {comparisonResult && (
            <div className="mt-4 space-y-2 p-3 bg-muted rounded-md">
              <h4 className="font-medium">Differences Summary:</h4>
              <p>{comparisonResult.differenceSummary || "Documents are similar in content."}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentVersionComparison;
