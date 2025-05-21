
import { DocumentVersion } from "@/types/documentVersion";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  FileText, 
  Trash2, 
  Share2,
  ArrowDownToLine,
  History
} from "lucide-react";
import { fileSize } from "@/lib/formatBytes";
import RestoreVersionButton from "./RestoreVersionButton";

interface DocumentVersionItemProps {
  version: DocumentVersion;
  selectedVersionId: string;
  onSelect: (version: DocumentVersion) => void;
  onDelete?: (version: DocumentVersion) => void;
  onShare?: (version: DocumentVersion) => void;
  onCompare?: (version: DocumentVersion) => void;
  canDelete: boolean;
  dealId: string;
  documentId: string;
  onRestored?: () => void;
}

const DocumentVersionItem = ({
  version,
  selectedVersionId,
  onSelect,
  onDelete,
  onShare,
  onCompare,
  canDelete,
  dealId,
  documentId,
  onRestored = () => {}
}: DocumentVersionItemProps) => {
  const isSelected = selectedVersionId === version.id;
  const formattedDate = new Date(version.uploadedAt).toLocaleDateString();
  const formattedTime = new Date(version.uploadedAt).toLocaleTimeString();
  
  // Tags rendering
  const renderTags = () => {
    if (!version.tags || version.tags.length === 0) {
      return null;
    }

    return (
      <div className="flex mt-1 flex-wrap gap-1">
        {version.tags.map(tag => (
          <span 
            key={tag.id} 
            className="px-1.5 py-0.5 rounded-full text-xs"
            style={{ 
              backgroundColor: tag.color, 
              color: isLightColor(tag.color) ? "#000" : "#fff"
            }}
          >
            {tag.name}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`p-2 rounded-md cursor-pointer ${
        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent"
      } transition-colors`}
      onClick={() => onSelect(version)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          <div>
            <div className="font-medium">Version {version.versionNumber}</div>
            <div className="text-xs opacity-80">
              {fileSize(version.size)} • {version.type}
              {version.isRestored && <span className="ml-1">(Restored)</span>}
            </div>
            <div className="text-xs opacity-80 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formattedDate} at {formattedTime}
            </div>
            {renderTags()}
          </div>
        </div>

        <div className="flex space-x-1">
          {onCompare && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${isSelected ? "hover:bg-primary-foreground/20" : "hover:bg-accent"}`}
              onClick={(e) => {
                e.stopPropagation();
                onCompare(version);
              }}
              title="Compare with another version"
            >
              <History className="h-4 w-4" />
            </Button>
          )}

          {onShare && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${isSelected ? "hover:bg-primary-foreground/20" : "hover:bg-accent"}`}
              onClick={(e) => {
                e.stopPropagation();
                onShare(version);
              }}
              title="Share version"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${isSelected ? "hover:bg-primary-foreground/20" : "hover:bg-accent"}`}
            onClick={(e) => {
              e.stopPropagation();
              window.open(version.url, "_blank");
            }}
            title="Download version"
          >
            <ArrowDownToLine className="h-4 w-4" />
          </Button>

          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${
                isSelected
                  ? "hover:bg-red-300"
                  : "hover:bg-red-100 text-red-500"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(version);
              }}
              title="Delete version"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Show restore button if selected */}
      {isSelected && (
        <div className="mt-2 flex justify-end">
          <RestoreVersionButton 
            version={version} 
            dealId={dealId}
            onRestored={onRestored}
          />
        </div>
      )}

      {/* Show description if it exists */}
      {version.description && (
        <div className="mt-2 text-xs italic">
          {version.description}
        </div>
      )}
    </div>
  );
};

// Helper function to determine if a color is light or dark
const isLightColor = (color: string) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 128;
};

export default DocumentVersionItem;
