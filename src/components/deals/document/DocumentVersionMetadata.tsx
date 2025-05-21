
import { useEffect, useState } from "react";
import { DocumentVersion } from "@/types/documentVersion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, User, Tag, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface DocumentVersionMetadataProps {
  version: DocumentVersion | null;
  dealId: string;
}

const DocumentVersionMetadata = ({
  version,
  dealId
}: DocumentVersionMetadataProps) => {
  const [uploaderName, setUploaderName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch uploader information when version changes
  useEffect(() => {
    const fetchUploaderInfo = async () => {
      if (!version) return;
      
      try {
        setLoading(true);
        // Get profile data which includes the name field
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', version.uploadedBy)
          .single();
          
        if (data) {
          setUploaderName(data.name || "Unknown User");
        } else {
          setUploaderName("Unknown User");
        }
      } catch (error) {
        console.error("Error fetching uploader info:", error);
        setUploaderName("Unknown User");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUploaderInfo();
  }, [version]);
  
  if (!version) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-medium">Version {version.versionNumber}</span>
          {version.isRestored && (
            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
              Restored
            </span>
          )}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{new Date(version.uploadedAt).toLocaleString()}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="h-4 w-4 mr-2" />
          <span>
            {loading ? <Skeleton className="h-4 w-24" /> : uploaderName}
          </span>
        </div>
        
        {version.tags && version.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
            {version.tags.map(tag => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: tag.color,
                  color: isLightColor(tag.color) ? "#000" : "#fff"
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
        
        {version.annotations && version.annotations.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center mb-1">
              <MessageCircle className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm font-medium">Annotations ({version.annotations.length})</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {version.annotations.map(annotation => (
                <div key={annotation.id} className="text-xs p-2 bg-muted rounded-md">
                  {annotation.content}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Button variant="outline" size="sm" className="w-full mt-2">
          Download Original
        </Button>
      </CardContent>
    </Card>
  );
};

// Utility function to determine if a color is light or dark
const isLightColor = (color: string): boolean => {
  // Convert hex to RGB
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // If brightness > 128, color is light
  return brightness > 128;
};

export default DocumentVersionMetadata;
