
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentVersion } from "@/types/documentVersion";

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

  return (
    <div className="flex items-center">
      <span className="text-sm mr-2 text-muted-foreground">Version:</span>
      <Select
        value={selectedVersionId}
        onValueChange={onSelectVersion}
      >
        <SelectTrigger className="h-8 w-[140px] text-sm">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((version) => (
            <SelectItem key={version.id} value={version.id}>
              {`V${version.versionNumber}`}
              {version.isRestored && " (Restored)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DocumentVersionSelector;
