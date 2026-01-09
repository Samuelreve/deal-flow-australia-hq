
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Loader2, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  created_at: string;
  category?: string;
}

interface DealRoomDocumentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: string;
  milestoneId: string;
  milestoneTitle?: string;
  onDocumentLinked: () => void;
}

const DealRoomDocumentSelector: React.FC<DealRoomDocumentSelectorProps> = ({
  isOpen,
  onClose,
  dealId,
  milestoneId,
  milestoneTitle,
  onDocumentLinked
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchDealDocuments();
      setSelectedDocumentId(null);
    }
  }, [isOpen, dealId]);

  const fetchDealDocuments = async () => {
    setLoading(true);
    try {
      // Fetch documents that are not already linked to this milestone
      const { data, error } = await supabase
        .from('documents')
        .select('id, name, type, size, created_at, category, milestone_id')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Filter out documents already linked to this milestone
      const availableDocuments = (data || []).filter(doc => doc.milestone_id !== milestoneId);
      setDocuments(availableDocuments);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkDocument = async () => {
    if (!selectedDocumentId) return;

    setLinking(true);
    try {
      // Update the document to link it to this milestone
      const { error } = await supabase
        .from('documents')
        .update({ milestone_id: milestoneId })
        .eq('id', selectedDocumentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Document linked to milestone successfully',
      });

      onDocumentLinked();
      onClose();
    } catch (error: any) {
      console.error('Error linking document:', error);
      toast({
        title: 'Error',
        description: 'Failed to link document to milestone',
        variant: 'destructive'
      });
    } finally {
      setLinking(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            Select Document from Deal Room
          </DialogTitle>
          {milestoneTitle && (
            <p className="text-sm text-muted-foreground mt-1">
              For milestone: {milestoneTitle}
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No documents available in the deal room</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a new document instead
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                      selectedDocumentId === document.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedDocumentId(document.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{document.name}</p>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(document.size)}
                          </span>
                          {document.category && (
                            <span className="text-xs text-muted-foreground">
                              {document.category}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(document.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {selectedDocumentId === document.id && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={linking}>
            Cancel
          </Button>
          <Button
            onClick={handleLinkDocument}
            disabled={!selectedDocumentId || linking}
          >
            {linking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Linking...
              </>
            ) : (
              'Link Document'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DealRoomDocumentSelector;
