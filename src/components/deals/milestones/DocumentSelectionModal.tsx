import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FileText, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  created_at: string;
  category?: string;
}

interface DocumentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: string;
  userRole: string;
  onDocumentSelected: (documentId: string) => void;
}

const DocumentSelectionModal: React.FC<DocumentSelectionModalProps> = ({
  isOpen,
  onClose,
  dealId,
  userRole,
  onDocumentSelected
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
      setStep('select');
      setSelectedDocumentId(null);
    }
  }, [isOpen, dealId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, name, type, size, created_at, category')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDocuments(data || []);
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

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  const handleGoForward = () => {
    if (!selectedDocumentId) {
      toast({
        title: 'No document selected',
        description: 'Please select a document to continue',
        variant: 'destructive'
      });
      return;
    }

    if (step === 'select') {
      setStep('confirm');
    } else {
      // Initiate DocuSign signing
      onDocumentSelected(selectedDocumentId);
      onClose();
    }
  };

  const handleGoBack = () => {
    if (step === 'confirm') {
      setStep('select');
    }
  };

  const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">
            {step === 'select' ? 'Select Document to Sign' : 'Confirm Document Signing'}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {step === 'select' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the document you want to sign for the Closing Preparations milestone.
              </p>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No documents found for this deal</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((document) => (
                    <div
                      key={document.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                        selectedDocumentId === document.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                      onClick={() => handleDocumentSelect(document.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{document.name}</p>
                          <div className="flex items-center space-x-4 mt-1">
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
                          <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium mb-2">Selected Document</h3>
                {selectedDocument && (
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{selectedDocument.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedDocument.size)} • {new Date(selectedDocument.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">What happens next?</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></div>
                    <p>You'll be redirected to DocuSign to sign this document</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></div>
                    <p>After you sign, the {userRole === 'buyer' ? 'seller' : 'buyer'} will receive an email to sign</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></div>
                    <p>Once both parties have signed, the Closing Preparations milestone can be completed</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={step === 'select' ? onClose : handleGoBack}
            className="flex items-center space-x-2"
          >
            {step === 'select' ? (
              <>
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <ArrowLeft className="h-4 w-4" />
                <span>Go Back</span>
              </>
            )}
          </Button>

          <Button
            onClick={handleGoForward}
            disabled={!selectedDocumentId}
            className="flex items-center space-x-2"
          >
            <span>{step === 'select' ? 'Continue' : 'Start Signing'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentSelectionModal;