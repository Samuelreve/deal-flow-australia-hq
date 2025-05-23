
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { DocumentHighlight } from '@/types/contract';

interface DocumentVersion {
  version: string;
  versionDate: string;
}

export interface DocumentVersionsProps {
  documentMetadata?: DocumentVersion;
  documentHighlights?: DocumentHighlight[];
  onExportHighlights?: () => void;
}

const DocumentVersions: React.FC<DocumentVersionsProps> = ({ 
  documentMetadata, 
  documentHighlights = [],
  onExportHighlights
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Versions & Highlights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {documentMetadata && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-primary/5 rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded">{documentMetadata.version}</span>
                <span className="text-sm">Current Version</span>
              </div>
              <span className="text-xs text-muted-foreground">{documentMetadata.versionDate}</span>
            </div>
          </div>
        )}
        
        {documentHighlights && documentHighlights.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Highlights</h3>
              <span className="text-xs text-muted-foreground">{documentHighlights.length} items</span>
            </div>
            
            {onExportHighlights && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={onExportHighlights}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Export Highlights
              </Button>
            )}
          </div>
        )}
        
        {(!documentMetadata && (!documentHighlights || documentHighlights.length === 0)) && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No versions or highlights available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentVersions;
