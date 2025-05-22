
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DocumentVersion {
  version: string;
  versionDate: string;
}

interface DocumentVersionsProps {
  documentMetadata: DocumentVersion;
}

const DocumentVersions: React.FC<DocumentVersionsProps> = ({ documentMetadata }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Versions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-primary/5 rounded-md">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded">{documentMetadata.version}</span>
              <span className="text-sm">Current Version</span>
            </div>
            <span className="text-xs text-muted-foreground">{documentMetadata.versionDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentVersions;
