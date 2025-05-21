
import { useState } from "react";
import { DocumentVersion, DocumentVersionTag, DocumentVersionAnnotation } from "@/types/documentVersion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentVersionManagement } from "@/hooks/useDocumentVersionManagement";
import { HexColorPicker } from "react-colorful";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tag, MessageSquarePlus, User, Calendar, XCircle } from "lucide-react";

interface DocumentVersionMetadataProps {
  version: DocumentVersion;
  dealId: string;
  onUpdate: () => void;
}

const DocumentVersionMetadata = ({
  version,
  dealId,
  onUpdate
}: DocumentVersionMetadataProps) => {
  const [addTagOpen, setAddTagOpen] = useState(false);
  const [addAnnotationOpen, setAddAnnotationOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#3B82F6");
  const [annotation, setAnnotation] = useState("");
  
  const { 
    addingTag, 
    addingAnnotation, 
    addVersionTag,
    addVersionAnnotation
  } = useDocumentVersionManagement(dealId);
  
  const handleAddTag = async () => {
    if (tagName && tagColor) {
      const result = await addVersionTag(version.id, tagName, tagColor);
      if (result) {
        setTagName("");
        setTagColor("#3B82F6");
        setAddTagOpen(false);
        onUpdate();
      }
    }
  };
  
  const handleAddAnnotation = async () => {
    if (annotation) {
      const result = await addVersionAnnotation(version.id, annotation);
      if (result) {
        setAnnotation("");
        setAddAnnotationOpen(false);
        onUpdate();
      }
    }
  };
  
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Version Metadata</span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setAddTagOpen(true)}
              className="flex items-center gap-1"
            >
              <Tag className="h-4 w-4" />
              Add Tag
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setAddAnnotationOpen(true)}
              className="flex items-center gap-1"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Add Annotation
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tags">
          <TabsList className="mb-4">
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="annotations">Annotations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tags">
            {(!version.tags || version.tags.length === 0) ? (
              <p className="text-muted-foreground text-center py-4">
                No tags added to this version yet
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {version.tags.map(tag => (
                  <span 
                    key={tag.id} 
                    className="px-2 py-1 rounded-full text-sm font-medium"
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
          </TabsContent>
          
          <TabsContent value="annotations">
            {(!version.annotations || version.annotations.length === 0) ? (
              <p className="text-muted-foreground text-center py-4">
                No annotations added to this version yet
              </p>
            ) : (
              <ScrollArea className="h-48">
                <div className="space-y-4">
                  {version.annotations.map(annotation => (
                    <Card key={annotation.id} className="bg-muted/50">
                      <CardContent className="pt-4">
                        <p className="mb-2">{annotation.content}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <User className="h-3 w-3 mr-1" />
                          <span className="mr-3">{annotation.user?.name || "Unknown user"}</span>
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{new Date(annotation.createdAt).toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Add Tag Dialog */}
      <Dialog open={addTagOpen} onOpenChange={setAddTagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tag to Version</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tag Name</label>
              <Input
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Enter tag name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tag Color</label>
              <div className="h-40 mb-2">
                <HexColorPicker color={tagColor} onChange={setTagColor} />
              </div>
              <Input
                value={tagColor}
                onChange={(e) => setTagColor(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTagOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTag} disabled={!tagName || addingTag}>
              {addingTag ? "Adding..." : "Add Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Annotation Dialog */}
      <Dialog open={addAnnotationOpen} onOpenChange={setAddAnnotationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Annotation to Version</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Annotation</label>
              <Textarea
                value={annotation}
                onChange={(e) => setAnnotation(e.target.value)}
                placeholder="Enter your annotation about this version"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAnnotationOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAnnotation} disabled={!annotation || addingAnnotation}>
              {addingAnnotation ? "Adding..." : "Add Annotation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
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

export default DocumentVersionMetadata;
