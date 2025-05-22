
import React from 'react';
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface VersionHistoryTabProps {
  documentId: string;
  documentName: string;
  isDemoMode?: boolean;
}

// Sample version history for demo
const sampleVersions = [
  {
    id: "v1",
    version: 1,
    uploadedBy: "John Smith",
    uploadedAt: "May 20, 2025 - 10:23 AM",
    description: "Initial draft",
    isLatest: true
  },
  {
    id: "v0",
    version: 0,
    uploadedBy: "Jane Doe",
    uploadedAt: "May 19, 2025 - 4:45 PM",
    description: "Template version",
    isLatest: false
  }
];

const VersionHistoryTab: React.FC<VersionHistoryTabProps> = ({ 
  documentId,
  documentName,
  isDemoMode = false
}) => {
  const versions = sampleVersions;
  
  return (
    <CardContent className="pt-4">
      <h3 className="text-sm font-medium mb-3">Version History</h3>
      <div className="space-y-3">
        {versions.map((version) => (
          <div 
            key={version.id} 
            className={`border rounded-md p-3 ${version.isLatest ? 'bg-blue-50 border-blue-200' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{version.uploadedBy.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">V{version.version}</span>
                {version.isLatest && (
                  <Badge variant="secondary" className="text-xs">Latest</Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
              >
                View
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {version.uploadedBy} - {version.uploadedAt}
            </p>
            <p className="text-xs mt-1">{version.description}</p>
          </div>
        ))}
      </div>
    </CardContent>
  );
};

export default VersionHistoryTab;
