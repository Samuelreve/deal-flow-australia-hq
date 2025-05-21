
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentVersion, VersionComparisonResult } from "@/types/documentVersion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentVersionManagement } from "@/hooks/useDocumentVersionManagement";
import { Loader2, Plus, Minus, Check } from "lucide-react";

interface DocumentVersionComparisonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: DocumentVersion[];
  dealId: string;
}

const DocumentVersionComparison = ({
  open,
  onOpenChange,
  versions,
  dealId
}: DocumentVersionComparisonProps) => {
  const [sourceVersionId, setSourceVersionId] = useState<string>("");
  const [targetVersionId, setTargetVersionId] = useState<string>("");
  const { comparing, comparison, compareVersions } = useDocumentVersionManagement(dealId);

  // Set default versions when dialog opens
  useEffect(() => {
    if (open && versions.length >= 2) {
      setSourceVersionId(versions[1]?.id || "");
      setTargetVersionId(versions[0]?.id || "");
    }
  }, [open, versions]);

  // Handle comparison
  const handleCompare = async () => {
    if (sourceVersionId && targetVersionId) {
      await compareVersions(sourceVersionId, targetVersionId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Compare Document Versions</DialogTitle>
          <DialogDescription>
            Select two versions to compare and see the differences between them.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Source Version</label>
            <Select value={sourceVersionId} onValueChange={setSourceVersionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select source version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map(version => (
                  <SelectItem key={version.id} value={version.id}>
                    Version {version.versionNumber} ({new Date(version.uploadedAt).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Target Version</label>
            <Select value={targetVersionId} onValueChange={setTargetVersionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select target version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map(version => (
                  <SelectItem key={version.id} value={version.id}>
                    Version {version.versionNumber} ({new Date(version.uploadedAt).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleCompare} 
          disabled={!sourceVersionId || !targetVersionId || sourceVersionId === targetVersionId || comparing}
          className="w-full mb-4"
        >
          {comparing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Compare Versions
        </Button>

        {comparison && (
          <div className="flex-1 overflow-hidden border rounded">
            <Tabs defaultValue="summary" className="h-full flex flex-col">
              <TabsList className="mx-4 mt-2">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="additions">Additions</TabsTrigger>
                <TabsTrigger value="deletions">Deletions</TabsTrigger>
                <TabsTrigger value="unchanged">Unchanged</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="flex-1 p-4 overflow-auto">
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Difference Summary</h3>
                    <p>{comparison.differenceSummary}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-2">
                        <Plus className="h-4 w-4 text-green-500 mr-2" />
                        <h4>Additions</h4>
                      </div>
                      <p className="text-2xl font-bold">{comparison.additions.length}</p>
                    </div>
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-2">
                        <Minus className="h-4 w-4 text-red-500 mr-2" />
                        <h4>Deletions</h4>
                      </div>
                      <p className="text-2xl font-bold">{comparison.deletions.length}</p>
                    </div>
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-2">
                        <Check className="h-4 w-4 text-blue-500 mr-2" />
                        <h4>Unchanged</h4>
                      </div>
                      <p className="text-2xl font-bold">{comparison.unchanged.length}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="additions" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  {comparison.additions.length === 0 ? (
                    <p className="text-muted-foreground italic">No additions found</p>
                  ) : (
                    <div className="space-y-2">
                      {comparison.additions.map((line, i) => (
                        <div key={i} className="bg-green-50 border-l-4 border-green-500 p-2 font-mono text-sm">
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="deletions" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  {comparison.deletions.length === 0 ? (
                    <p className="text-muted-foreground italic">No deletions found</p>
                  ) : (
                    <div className="space-y-2">
                      {comparison.deletions.map((line, i) => (
                        <div key={i} className="bg-red-50 border-l-4 border-red-500 p-2 font-mono text-sm">
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="unchanged" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  {comparison.unchanged.length === 0 ? (
                    <p className="text-muted-foreground italic">No unchanged lines found</p>
                  ) : (
                    <div className="space-y-2">
                      {comparison.unchanged.map((line, i) => (
                        <div key={i} className="bg-blue-50 border-l-4 border-blue-500 p-2 font-mono text-sm">
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentVersionComparison;
