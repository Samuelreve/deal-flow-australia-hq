import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface SignaturePosition {
  x: number;
  y: number;
  page: number;
  recipientId: string;
  recipientName: string;
}

interface SignaturePositioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (positions: SignaturePosition[]) => void;
  documentUrl: string;
  signers: Array<{
    email: string;
    name: string;
    recipientId: string;
  }>;
  isLoading?: boolean;
}

const SignaturePositioningModal: React.FC<SignaturePositioningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  documentUrl,
  signers,
  isLoading = false
}) => {
  const [signaturePositions, setSignaturePositions] = useState<SignaturePosition[]>([]);
  const [currentSignerIndex, setCurrentSignerIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageCanvas, setPageCanvas] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    recipientId: string | null;
    startX: number;
    startY: number;
  }>({
    isDragging: false,
    recipientId: null,
    startX: 0,
    startY: 0
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize signature positions
  useEffect(() => {
    if (isOpen && signers.length > 0) {
      const initialPositions = signers.map((signer, index) => {
        console.log(`Initializing signer ${index}:`, signer.name, 'ID:', signer.recipientId);
        return {
          x: 100 + (index * 200), // Spread them apart horizontally
          y: 200 + (index * 100),
          page: 1,
          recipientId: signer.recipientId,
          recipientName: signer.name
        };
      });
      console.log('All initial positions:', initialPositions);
      setSignaturePositions(initialPositions);
      setCurrentSignerIndex(null);
    }
  }, [isOpen, signers]);

  // Load PDF document
  useEffect(() => {
    const loadPdf = async () => {
      if (!documentUrl) return;
      
      try {
        setIsLoadingPdf(true);
        const loadingTask = pdfjsLib.getDocument(documentUrl);
        const pdf = await loadingTask.promise;
        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);
        console.log('PDF loaded successfully, total pages:', pdf.numPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
        toast({
          title: 'Error loading PDF',
          description: 'Failed to load the PDF document',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingPdf(false);
      }
    };

    if (isOpen && documentUrl) {
      loadPdf();
    }
  }, [isOpen, documentUrl, toast]);

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocument) return;
      
      try {
        console.log('Rendering page:', currentPage);
        const page = await pdfDocument.getPage(currentPage);
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        // Set up viewport
        const viewport = page.getViewport({ scale: zoom });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render page
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        
        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/png');
        setPageCanvas(imageDataUrl);
        console.log('Page rendered successfully');
      } catch (error) {
        console.error('Error rendering page:', error);
        toast({
          title: 'Error rendering page',
          description: 'Failed to render the PDF page',
          variant: 'destructive'
        });
      }
    };

    if (pdfDocument && currentPage) {
      renderPage();
    }
  }, [pdfDocument, currentPage, zoom, toast]);

  // Global mouse event handlers for proper drag and drop
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (dragState.isDragging && dragState.recipientId) {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = Math.round((event.clientX - rect.left) / zoom);
        const y = Math.round((event.clientY - rect.top) / zoom);

        setSignaturePositions(prev => {
          console.log('Current dragState.recipientId:', dragState.recipientId);
          console.log('All positions before update:', prev.map(p => ({ name: p.recipientName, id: p.recipientId })));
          
          return prev.map(pos => {
            if (pos.recipientId === dragState.recipientId) {
              console.log(`✅ Updating position for ${pos.recipientName} (${pos.recipientId}): x=${x}, y=${y}`);
              return { ...pos, x, y };
            } else {
              console.log(`❌ NOT updating ${pos.recipientName} (${pos.recipientId})`);
              return pos;
            }
          });
        });
      }
    };

    const handleGlobalMouseUp = () => {
      if (dragState.isDragging) {
        setDragState({
          isDragging: false,
          recipientId: null,
          startX: 0,
          startY: 0
        });
      }
    };

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState, zoom]);

  const handleDocumentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.isDragging) return;
    
    // Only allow positioning if a signer is selected
    if (currentSignerIndex === null) {
      toast({
        title: 'No signer selected',
        description: 'Please select a signer from the left panel first',
        variant: 'destructive'
      });
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) / zoom);
    const y = Math.round((event.clientY - rect.top) / zoom);

    const currentSigner = signers[currentSignerIndex];
    if (!currentSigner) return;

    setSignaturePositions(prev => {
      const newPositions = [...prev];
      const existingIndex = newPositions.findIndex(
        p => p.recipientId === currentSigner.recipientId
      );

      if (existingIndex >= 0) {
        newPositions[existingIndex] = {
          ...newPositions[existingIndex],
          x,
          y,
          page: currentPage
        };
      } else {
        newPositions.push({
          x,
          y,
          page: currentPage,
          recipientId: currentSigner.recipientId,
          recipientName: currentSigner.name
        });
      }

      return newPositions;
    });

    toast({
      title: 'Signature position set',
      description: `Position set for ${currentSigner.name} at page ${currentPage} (${x}, ${y})`,
    });
  };

  const handleSignatureMouseDown = (recipientId: string, event: React.MouseEvent) => {
    // Only allow dragging if the current signer is selected
    if (currentSignerIndex === null) {
      toast({
        title: 'No signer selected',
        description: 'Please select a signer from the left panel first',
        variant: 'destructive'
      });
      return;
    }

    // Only allow dragging if the signature belongs to the currently selected signer
    const currentSigner = signers[currentSignerIndex];
    if (currentSigner.recipientId !== recipientId) {
      toast({
        title: 'Wrong signer selected',
        description: 'You can only move the signature for the currently selected signer',
        variant: 'destructive'
      });
      return;
    }

    event.stopPropagation();
    console.log('Starting drag for recipientId:', recipientId);
    setDragState({
      isDragging: true,
      recipientId,
      startX: event.clientX,
      startY: event.clientY
    });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleConfirm = () => {
    if (signaturePositions.length !== signers.length) {
      toast({
        title: 'Missing signature positions',
        description: 'Please set signature positions for all signers',
        variant: 'destructive'
      });
      return;
    }

    onConfirm(signaturePositions);
  };

  const currentSigner = currentSignerIndex !== null ? signers[currentSignerIndex] : null;
  const currentPosition = signaturePositions.find(
    p => p.recipientId === currentSigner?.recipientId
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            Position Signature Fields
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Click on the document to position signature fields for each signer
          </p>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Left Panel - Signer List */}
          <div className="w-72 border-r pr-4 space-y-4">
            <div>
              <h3 className="font-medium mb-2">Signers</h3>
              <div className="space-y-2">
                {signers.map((signer, index) => {
                  const position = signaturePositions.find(p => p.recipientId === signer.recipientId);
                  const isActive = currentSignerIndex === index;
                  
                  return (
                    <div
                      key={signer.recipientId}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setCurrentSignerIndex(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{signer.name}</p>
                          <p className="text-xs text-muted-foreground">{signer.email}</p>
                        </div>
                        <div className="text-xs">
                          {position ? (
                            <span className="text-green-600">✓ Set</span>
                          ) : (
                            <span className="text-muted-foreground">Click to position</span>
                          )}
                        </div>
                      </div>
                      {position && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Position: ({position.x}, {position.y})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {currentSigner && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">
                  Currently positioning: {currentSigner.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Click anywhere on the document to set the signature position
                </p>
              </div>
            )}

          </div>

          {/* Right Panel - Document Preview */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
            {/* Page Navigation */}
            <div className="flex items-center justify-between p-3 border-b bg-white">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Page
                </Button>
                <span className="text-sm px-3 py-1 bg-muted rounded">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next Page
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {currentSigner ? `Positioning for: ${currentSigner.name}` : 'Select a signer to position'}
              </div>
            </div>

            <div 
              ref={containerRef}
              className="flex-1 relative cursor-crosshair border rounded-lg bg-white overflow-auto"
              style={{ 
                width: '100%',
                minHeight: '600px'
              }}
              onClick={handleDocumentClick}
            >
              {/* Document preview using PDF.js rendered canvas */}
              {isLoadingPdf ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              ) : pageCanvas ? (
                <div className="relative w-full h-full flex justify-center bg-gray-100">
                  <img
                    src={pageCanvas}
                    alt={`PDF Page ${currentPage}`}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center top'
                    }}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gray-200 p-8 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-gray-600">No document available</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Overlay for click handling */}
              <div 
                className="absolute inset-0 bg-transparent cursor-crosshair"
                onClick={handleDocumentClick}
              />

              {/* Render signature position indicators for current page only */}
              {signaturePositions
                .filter(position => position.page === currentPage)
                .map((position) => {
                  const signer = signers.find(s => s.recipientId === position.recipientId);
                  const isCurrentSigner = currentSigner?.recipientId === position.recipientId;
                  
                  return (
                    <div
                      key={position.recipientId}
                      className={`absolute border-2 rounded px-2 py-1 text-xs font-medium cursor-move z-10 ${
                        isCurrentSigner 
                          ? 'border-primary bg-primary/20 text-primary' 
                          : 'border-blue-500 bg-blue-500/20 text-blue-700'
                      }`}
                      style={{
                        left: position.x,
                        top: position.y,
                        width: '150px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseDown={(e) => {
                        handleSignatureMouseDown(position.recipientId, e);
                      }}
                    >
                      {signer?.name || 'Unknown'} - Sign Here
                    </div>
                  );
                })}

              {/* Instruction overlay when no document is loaded */}
              {!documentUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
                    Loading document...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel</span>
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={isLoading || signaturePositions.length !== signers.length}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Start Signing Process</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignaturePositioningModal;