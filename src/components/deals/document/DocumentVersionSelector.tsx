
import React from "react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentVersion } from "@/types/documentVersion";
import { Badge } from "@/components/ui/badge";
import { History, Clock } from "lucide-react";

interface DocumentVersionSelectorProps {
  versions: DocumentVersion[];
  selectedVersionId: string;
  onSelectVersion: (versionId: string) => void;
}

const DocumentVersionSelector = ({
  versions,
  selectedVersionId,
  onSelectVersion
}: DocumentVersionSelectorProps) => {
  if (versions.length === 0) {
    return null;
  }

  // Find the selected version to display details
  const selectedVersion = versions.find(v => v.id === selectedVersionId);

  return (
    <div className="flex items-center">
      <div className="flex items-center mr-2">
        <History className="h-4 w-4 text-muted-foreground mr-1" />
        <span className="text-sm text-muted-foreground">Version:</span>
      </div>
      <Select
        value={selectedVersionId}
        onValueChange={onSelectVersion}
      >
        <SelectTrigger className="h-8 w-[180px] text-sm">
          <SelectValue placeholder="Select version">
            {selectedVersion && (
              <span className="flex items-center">
                V{selectedVersion.versionNumber}
                {selectedVersion.isRestored && (
                  <Badge variant="outline" className="ml-2 text-xs px-1">Restored</Badge>
                )}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {versions.map((version) => (
            <SelectItem key={version.id} value={version.id} className="py-2">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="font-medium">V{version.versionNumber}</span>
                  {version.isRestored && (
                    <Badge variant="outline" className="ml-2 text-xs">Restored</Badge>
                  )}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{format(new Date(version.uploadedAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DocumentVersionSelector;
