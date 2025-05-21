
import { useEffect, useState } from "react";
import { DocumentVersion } from "@/types/documentVersion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/formatBytes";
import { Tag, Clock, CalendarDays, FileText } from "lucide-react";
import { useDocumentVersionManagement } from "@/hooks/useDocumentVersionManagement";

interface DocumentVersionMetadataProps {
  version: DocumentVersion;
  dealId: string;
  onVersionsUpdated?: () => void;
}

const DocumentVersionMetadata = ({ 
  version,
  dealId,
  onVersionsUpdated = () => {}
}: DocumentVersionMetadataProps) => {
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#3b82f6");
  
  const { 
    addVersionTag, 
    removeVersionTag,
    isLoading 
  } = useDocumentVersionManagement(dealId, version.documentId, onVersionsUpdated);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tagName.trim()) {
      await addVersionTag(version.id, { name: tagName, color: tagColor });
      setTagName("");
      setShowTagInput(false);
    }
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Version {version.versionNumber} Metadata
          </CardTitle>
          {version.tags && version.tags.length > 0 && (
            <div className="flex gap-1">
              {version.tags.map(tag => (
                <Badge 
                  key={tag.id}
                  style={{ backgroundColor: tag.color, color: '#fff' }}
                  className="flex items-center"
                >
                  {tag.name}
                  <button 
                    onClick={() => removeVersionTag(version.id, tag.id)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTagInput(!showTagInput)}
            className="flex items-center"
          >
            <Tag className="h-3 w-3 mr-1" />
            {showTagInput ? "Cancel" : "Add Tag"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="py-3 space-y-4">
        {showTagInput && (
          <form onSubmit={handleAddTag} className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Tag name"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
            />
            <input
              type="color"
              className="h-9 w-12 cursor-pointer border border-input rounded-md"
              value={tagColor}
              onChange={(e) => setTagColor(e.target.value)}
            />
            <Button type="submit" size="sm" disabled={isLoading}>Add</Button>
          </form>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Uploaded
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(version.uploadedAt).toLocaleString()}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              File Details
            </div>
            <div className="text-sm text-muted-foreground">
              {formatBytes(version.size)} • {version.type}
            </div>
          </div>
        </div>
        
        {version.description && (
          <div className="space-y-1">
            <div className="text-sm font-medium">Description</div>
            <div className="text-sm text-muted-foreground">{version.description}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentVersionMetadata;
