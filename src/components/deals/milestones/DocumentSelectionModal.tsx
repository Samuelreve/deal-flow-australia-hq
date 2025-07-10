import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FileText, X, ArrowLeft, ArrowRight, User } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  created_at: string;
  category?: string;
}

interface Buyer {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface DocumentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: string;
  userRole: string;
  onDocumentSelected: (documentId: string, buyerId?: string) => void;
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
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [step, setStep] = useState<'select' | 'buyer' | 'confirm'>('select');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      console.log('DocumentSelectionModal opened with userRole:', userRole);
      fetchDocuments();
      if (userRole.toLowerCase() === 'seller' || userRole.toLowerCase() === 'admin') {
        console.log('User is seller/admin, fetching buyers...');
        fetchBuyers();
      } else {
        console.log('User is not seller/admin, skipping buyer fetch. UserRole:', userRole);
      }
      setStep('select');
      setSelectedDocumentId(null);
      setSelectedBuyerId(null);
    }
  }, [isOpen, dealId, userRole]);

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

  const fetchBuyers = async () => {
    setLoadingBuyers(true);
    try {
      const { data, error } = await supabase
        .from('deal_participants')
        .select(`
          user_id,
          profiles:user_id (
            name,
            email,
            avatar_url
          )
        `)
        .eq('deal_id', dealId)
        .eq('role', 'buyer');

      if (error) {
        throw error;
      }

      const buyersList: Buyer[] = (data || []).map((item: any) => ({
        id: item.user_id,
        name: item.profiles?.name || 'Unknown Buyer',
        email: item.profiles?.email || '',
        avatar_url: item.profiles?.avatar_url
      }));

      setBuyers(buyersList);
    } catch (error: any) {
      console.error('Error fetching buyers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load buyers',
        variant: 'destructive'
      });
    } finally {
      setLoadingBuyers(false);
    }
  };

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  const handleGoForward = () => {
    console.log('handleGoForward called with step:', step, 'userRole:', userRole);
    
    if (step === 'select') {
      if (!selectedDocumentId) {
        toast({
          title: 'No document selected',
          description: 'Please select a document to continue',
          variant: 'destructive'
        });
        return;
      }
      
      // For sellers and admins, go to buyer selection step
      if (userRole.toLowerCase() === 'seller' || userRole.toLowerCase() === 'admin') {
        console.log('Moving to buyer selection step');
        setStep('buyer');
      } else {
        console.log('Skipping to confirmation step for non-seller/admin');
        // For buyers, skip to confirmation
        setStep('confirm');
      }
    } else if (step === 'buyer') {
      if (!selectedBuyerId) {
        toast({
          title: 'No buyer selected',
          description: 'Please select a buyer to continue',
          variant: 'destructive'
        });
        return;
      }
      console.log('Moving to confirmation step from buyer selection');
      setStep('confirm');
    } else {
      console.log('Starting DocuSign process');
      // Initiate DocuSign signing
      onDocumentSelected(selectedDocumentId!, selectedBuyerId || undefined);
      onClose();
    }
  };

  const handleGoBack = () => {
    if (step === 'confirm') {
      if (userRole.toLowerCase() === 'seller' || userRole.toLowerCase() === 'admin') {
        setStep('buyer');
      } else {
        setStep('select');
      }
    } else if (step === 'buyer') {
      setStep('select');
    }
  };

  const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);
  const selectedBuyer = buyers.find(buyer => buyer.id === selectedBuyerId);

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
            {step === 'select' && 'Select Document to Sign'}
            {step === 'buyer' && 'Select Buyer to Co-Sign'}
            {step === 'confirm' && 'Confirm Document Signing'}
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
          ) : step === 'buyer' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the buyer who will co-sign this document with you.
              </p>

              {loadingBuyers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : buyers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No buyers found for this deal</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {buyers.map((buyer) => (
                    <div
                      key={buyer.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                        selectedBuyerId === buyer.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                      onClick={() => setSelectedBuyerId(buyer.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{buyer.name}</p>
                          <p className="text-xs text-muted-foreground">{buyer.email}</p>
                        </div>
                        {selectedBuyerId === buyer.id && (
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

              {(userRole.toLowerCase() === 'seller' || userRole.toLowerCase() === 'admin') && selectedBuyer && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Selected Buyer</h3>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{selectedBuyer.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedBuyer.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-medium">What happens next?</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></div>
                    <p>You'll be redirected to DocuSign to sign this document</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></div>
                    <p>After you sign, the {userRole.toLowerCase() === 'buyer' ? 'seller' : selectedBuyer ? selectedBuyer.name : 'buyer'} will receive an email to sign</p>
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
            disabled={
              (step === 'select' && !selectedDocumentId) ||
              (step === 'buyer' && !selectedBuyerId) ||
              (step === 'confirm' && (!selectedDocumentId || ((userRole.toLowerCase() === 'seller' || userRole.toLowerCase() === 'admin') && !selectedBuyerId)))
            }
            className="flex items-center space-x-2"
          >
            <span>
              {step === 'select' && 'Continue'}
              {step === 'buyer' && 'Continue'}
              {step === 'confirm' && 'Start Signing'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentSelectionModal;