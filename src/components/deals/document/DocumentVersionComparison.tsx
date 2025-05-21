
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DocumentVersion, VersionComparisonResult } from "@/types/documentVersion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { versionComparisonService } from "@/services/documents/version-management";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface DocumentVersionComparisonProps {
  versions: DocumentVersion[];
  selectedVersionId: string;
  dealId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentVersionComparison = ({
  versions,
  selectedVersionId,
  dealId,
  open,
  onOpenChange
}: DocumentVersionComparisonProps) => {
  const [compareVersionId, setCompareVersionId] = useState<string>("");
  const [comparisonResult, setComparisonResult] = useState<VersionComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("differences");
  
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [comparisonSummary, setComparisonSummary] = useState<{ summary: string; disclaimer: string } | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Select the most recent version (other than the current one) for comparison by default
  useEffect(() => {
    if (open && versions.length > 1 && !compareVersionId) {
      const otherVersions = versions.filter(v => v.id !== selectedVersionId);
      if (otherVersions.length > 0) {
        // Sort by version number descending and take the first one
        otherVersions.sort((a, b) => b.versionNumber - a.versionNumber);
        setCompareVersionId(otherVersions[0].id);
      }
    }
  }, [open, versions, selectedVersionId, compareVersionId]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setComparisonResult(null);
      setError(null);
      setComparisonSummary(null);
      setSummaryError(null);
      setActiveTab("differences");
    }
  }, [open]);

  // Fetch comparison when both versions are selected
  useEffect(() => {
    const fetchComparison = async () => {
      if (selectedVersionId && compareVersionId && selectedVersionId !== compareVersionId) {
        setLoading(true);
        setError(null);
        try {
          const result = await versionComparisonService.compareVersions(
            selectedVersionId,
            compareVersionId,
            dealId
          );
          setComparisonResult(result);
        } catch (err: any) {
          setError(err.message || "Failed to compare versions");
        } finally {
          setLoading(false);
        }
      }
    };

    if (open && selectedVersionId && compareVersionId) {
      fetchComparison();
    }
  }, [selectedVersionId, compareVersionId, dealId, open]);

  const handleCompareVersionChange = (versionId: string) => {
    setCompareVersionId(versionId);
  };

  const getCurrentVersionName = () => {
    const version = versions.find(v => v.id === selectedVersionId);
    return version ? `Version ${version.versionNumber}` : "Current";
  };

  const getCompareVersionName = () => {
    const version = versions.find(v => v.id === compareVersionId);
    return version ? `Version ${version.versionNumber}` : "Select a version";
  };

  const getAISummary = async () => {
    if (selectedVersionId && compareVersionId && selectedVersionId !== compareVersionId) {
      setLoadingSummary(true);
      setSummaryError(null);
      
      try {
        const summary = await versionComparisonService.getVersionComparisonSummary(
          selectedVersionId,
          compareVersionId,
          dealId
        );
        setComparisonSummary(summary);
      } catch (err: any) {
        setSummaryError(err.message || "Failed to generate AI summary");
      } finally {
        setLoadingSummary(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Document Version Comparison</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          <div>
            <div className="text-sm font-medium mb-1">Current</div>
            <Badge variant="outline" className="font-mono">
              {getCurrentVersionName()}
            </Badge>
          </div>
          
          <div>vs</div>
          
          <div>
            <div className="text-sm font-medium mb-1">Compare with</div>
            <Select value={compareVersionId} onValueChange={handleCompareVersionChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {versions
                  .filter(v => v.id !== selectedVersionId)
                  .map(version => (
                    <SelectItem key={version.id} value={version.id}>
                      Version {version.versionNumber}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="differences">Differences</TabsTrigger>
            <TabsTrigger value="ai-summary">AI Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="differences" className="flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <div className="flex flex-col items-center justify-center flex-1 py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Comparing versions...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : comparisonResult ? (
              <ScrollArea className="flex-1">
                <div className="space-y-6 p-4">
                  {comparisonResult.differenceSummary && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Summary</h3>
                      <p className="text-muted-foreground">{comparisonResult.differenceSummary}</p>
                    </div>
                  )}

                  {comparisonResult.additions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-green-600 dark:text-green-400">
                        Additions ({comparisonResult.additions.length})
                      </h3>
                      <div className="space-y-2">
                        {comparisonResult.additions.map((addition, i) => (
                          <div 
                            key={i} 
                            className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400 rounded"
                          >
                            {addition}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {comparisonResult.deletions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-red-600 dark:text-red-400">
                        Deletions ({comparisonResult.deletions.length})
                      </h3>
                      <div className="space-y-2">
                        {comparisonResult.deletions.map((deletion, i) => (
                          <div 
                            key={i} 
                            className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 rounded"
                          >
                            {deletion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {comparisonResult.unchanged.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-muted-foreground">
                        Unchanged ({comparisonResult.unchanged.length})
                      </h3>
                      <div className="space-y-2">
                        {comparisonResult.unchanged.slice(0, 5).map((text, i) => (
                          <div 
                            key={i} 
                            className="p-3 bg-muted/50 border-l-4 border-muted-foreground/30 rounded"
                          >
                            {text}
                          </div>
                        ))}
                        {comparisonResult.unchanged.length > 5 && (
                          <div className="text-center text-sm text-muted-foreground p-2">
                            + {comparisonResult.unchanged.length - 5} more unchanged sections
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-6 text-center text-muted-foreground">
                <p>Select a version to compare with the current version</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-summary" className="flex-1 overflow-hidden flex flex-col">
            {!comparisonSummary && !loadingSummary && !summaryError && (
              <div className="flex flex-col items-center justify-center flex-1 p-6">
                <p className="text-muted-foreground mb-4 text-center">
                  Get an AI-generated summary of the key differences between versions
                </p>
                <Button 
                  onClick={getAISummary}
                  disabled={!selectedVersionId || !compareVersionId || selectedVersionId === compareVersionId}
                >
                  Generate AI Summary
                </Button>
              </div>
            )}

            {loadingSummary && (
              <div className="flex flex-col items-center justify-center flex-1 py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Generating AI summary...</p>
              </div>
            )}

            {summaryError && (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{summaryError}</AlertDescription>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={getAISummary}
                >
                  Try Again
                </Button>
              </Alert>
            )}

            {comparisonSummary && (
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <Card className="p-4 mb-4">
                    <h3 className="text-lg font-medium mb-4">AI Summary of Changes</h3>
                    <div className="whitespace-pre-line">{comparisonSummary.summary}</div>
                  </Card>
                  
                  <Alert className="bg-muted/40">
                    <AlertDescription className="text-sm">
                      {comparisonSummary.disclaimer}
                    </AlertDescription>
                  </Alert>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentVersionComparison;
