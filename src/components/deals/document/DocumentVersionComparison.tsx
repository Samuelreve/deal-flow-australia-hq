
import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentVersion, VersionComparisonResult } from "@/types/documentVersion";
import { versionComparisonService } from "@/services/documents/version-management/versionComparisonService";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileText, GitCompare } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [comparisonResult, setComparisonResult] = useState<VersionComparisonResult | null>(null);
  const [comparisonProgress, setComparisonProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("summary");
  const { toast } = useToast();

  // Find previous version for comparison
  const selectedVersionIndex = versions.findIndex(v => v.id === selectedVersionId);
  const hasPreviousVersion = selectedVersionIndex < versions.length - 1 && selectedVersionIndex !== -1;
  const previousVersion = hasPreviousVersion ? versions[selectedVersionIndex + 1] : null;
  const selectedVersion = versions.find(v => v.id === selectedVersionId);

  // Reset progress and result when versions change
  useEffect(() => {
    setComparisonResult(null);
    setComparisonProgress(0);
  }, [selectedVersionId]);

  // Simulate progress updates during comparison
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    
    if (comparing) {
      setComparisonProgress(0);
      
      progressInterval = setInterval(() => {
        setComparisonProgress(prev => {
          const newProgress = prev + (100 - prev) * 0.1;
          return Math.min(newProgress, 95);
        });
      }, 500);
    } else if (comparisonProgress > 0 && comparisonProgress < 100) {
      setComparisonProgress(100);
      
      const resetTimeout = setTimeout(() => {
        setComparisonProgress(0);
      }, 1000);
      
      return () => clearTimeout(resetTimeout);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [comparing, comparisonProgress]);

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
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Version Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This is the earliest version of this document. There are no previous versions to compare with.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <GitCompare className="h-4 w-4" /> Version Comparison
          </CardTitle>
        </div>
        {onOpenChange && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Close</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor"/>
            </svg>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm mb-1">
                Comparing <span className="font-medium">V{selectedVersion?.versionNumber}</span> with previous version <span className="font-medium">V{previousVersion?.versionNumber}</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>
                  {new Date(selectedVersion?.uploadedAt || '').toLocaleDateString()}
                </span>
                <span>→</span>
                <span>
                  {new Date(previousVersion?.uploadedAt || '').toLocaleDateString()}
                </span>
              </div>
            </div>

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
              ) : comparisonResult ? (
                "Compare Again"
              ) : (
                "Compare Versions"
              )}
            </Button>
          </div>

          {comparing && (
            <div className="mb-6">
              <Progress value={comparisonProgress} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground text-center">Analyzing document differences...</p>
            </div>
          )}

          {comparisonResult && (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="additions">
                    Additions
                    <Badge variant="outline" className="ml-2">
                      {comparisonResult.additions.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="deletions">
                    Deletions
                    <Badge variant="outline" className="ml-2">
                      {comparisonResult.deletions.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary">
                  <div className="p-4 bg-muted rounded-md">
                    <h4 className="font-medium mb-2">Differences Summary:</h4>
                    <p className="text-sm">{comparisonResult.differenceSummary || "Documents are similar in content."}</p>
                    
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="p-3 bg-background rounded-md border">
                        <div className="text-xl font-bold">{comparisonResult.additions.length}</div>
                        <div className="text-xs text-muted-foreground">Additions</div>
                      </div>
                      <div className="p-3 bg-background rounded-md border">
                        <div className="text-xl font-bold">{comparisonResult.deletions.length}</div>
                        <div className="text-xs text-muted-foreground">Deletions</div>
                      </div>
                      <div className="p-3 bg-background rounded-md border">
                        <div className="text-xl font-bold">{comparisonResult.unchanged.length}</div>
                        <div className="text-xs text-muted-foreground">Unchanged</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="additions">
                  <div className="max-h-60 overflow-y-auto rounded-md border p-2">
                    {comparisonResult.additions.length > 0 ? (
                      comparisonResult.additions.map((addition, index) => (
                        <div key={index} className="p-2 bg-green-50 mb-2 rounded text-sm">
                          <span className="font-mono">{addition}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center p-4">No additions detected</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="deletions">
                  <div className="max-h-60 overflow-y-auto rounded-md border p-2">
                    {comparisonResult.deletions.length > 0 ? (
                      comparisonResult.deletions.map((deletion, index) => (
                        <div key={index} className="p-2 bg-red-50 mb-2 rounded text-sm">
                          <span className="font-mono">{deletion}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center p-4">No deletions detected</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}

          {!comparing && !comparisonResult && (
            <div className="flex flex-col items-center justify-center p-8 bg-muted/40 rounded-md">
              <GitCompare className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-center font-medium">Compare document versions</p>
              <p className="text-center text-sm text-muted-foreground mb-4">
                See what has changed between versions
              </p>
              <Button 
                onClick={() => compareVersions(selectedVersionId)}
                size="sm"
              >
                Start Comparison
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentVersionComparison;
