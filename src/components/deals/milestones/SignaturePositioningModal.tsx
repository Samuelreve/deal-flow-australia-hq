import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import * as PDFJS from 'pdfjs-dist';
import type {
  PDFDocumentProxy,
  RenderParameters,
} from 'pdfjs-dist/types/src/display/api';

// Configure PDF.js worker - use local worker file with matching version
PDFJS.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

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
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const renderTaskRef = useRef<PDFJS.RenderTask | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const isRenderingRef = useRef(false);
  const loadedDocumentUrlRef = useRef<string | null>(null);

  // Initialize signature positions
  useEffect(() => {
    if (isOpen && signers.length > 0) {
      const initialPositions = signers.map((signer, index) => {
        return {
          x: 100 + (index * 200),
          y: 200 + (index * 100),
          page: 1,
          recipientId: signer.recipientId,
          recipientName: signer.name
        };
      });
      setSignaturePositions(initialPositions);
      setCurrentSignerIndex(null);
    }
  }, [isOpen, signers]);

    // Load PDF document (metadata only, not pages) - prevent multiple loads
  useEffect(() => {
    if (!documentUrl || !isOpen) return;
    if (loadedDocumentUrlRef.current === documentUrl) return; // Already loaded

    console.log(`Loading PDF document: ${documentUrl}`);
    loadedDocumentUrlRef.current = documentUrl;
    setIsLoadingPdf(true);
    setError(null);
    
    const loadingTask = PDFJS.getDocument(documentUrl);
    loadingTask.promise.then(
      (loadedDoc) => {
        setPdfDocument(loadedDoc);
        setTotalPages(loadedDoc.numPages);
        setCurrentPage(1); // This will trigger first page render
        setIsLoadingPdf(false);
        console.log(`✅ PDF metadata loaded - ${loadedDoc.numPages} pages available`);
      },
      (error) => {
        console.error('PDF loading error:', error);
        setError('Failed to load PDF document');
        setIsLoadingPdf(false);
        loadedDocumentUrlRef.current = null; // Reset on error
        toast({
          title: 'Error loading PDF',
          description: 'Failed to load PDF document',
          variant: 'destructive'
        });
      }
    );
  }, [documentUrl, isOpen, toast]);

  // Render ONLY the current page when page changes - with proper synchronization
  useEffect(() => {
    if (!pdfDocument || !currentPage) return;

    const renderCurrentPage = async () => {
      // Immediate check using ref to prevent race conditions
      if (isRenderingRef.current) {
        console.log(`⏸️ Skipping render - already rendering`);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set rendering flag immediately
      isRenderingRef.current = true;
      setIsRendering(true);

      try {
        // Cancel any ongoing render task first
        if (renderTaskRef.current) {
          console.log(`❌ Cancelling previous render task`);
          renderTaskRef.current.cancel();
          await new Promise(resolve => setTimeout(resolve, 10)); // Small delay to ensure cancellation
          renderTaskRef.current = null;
        }
        
        console.log(`🔄 Starting to render page ${currentPage}...`);
        
        // Clear canvas completely
        const context = canvas.getContext('2d')!;
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Load ONLY the specific page requested
        console.log(`📄 Loading page ${currentPage} from PDF...`);
        const page = await pdfDocument.getPage(currentPage);
        const viewport = page.getViewport({ scale: zoom });
        
        // Set canvas dimensions for this specific page
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext: RenderParameters = {
          canvasContext: context,
          viewport: viewport,
        };
        
        // Render ONLY this page
        console.log(`🎨 Rendering page ${currentPage} to canvas...`);
        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        
        // Clear the render task reference when completed
        renderTaskRef.current = null;
        console.log(`✅ Successfully rendered page ${currentPage}`);
        
      } catch (error) {
        if (error instanceof Error && error.name === 'RenderingCancelledException') {
          console.log(`🚫 Rendering of page ${currentPage} was cancelled`);
        } else {
          console.error(`❌ Error rendering page ${currentPage}:`, error);
          setError(`Failed to render page ${currentPage}`);
        }
        renderTaskRef.current = null;
      } finally {
        // Always reset rendering flags
        isRenderingRef.current = false;
        setIsRendering(false);
      }
    };

    renderCurrentPage();
  }, [currentPage, pdfDocument, zoom]);

  // Cleanup render tasks on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
      isRenderingRef.current = false;
      loadedDocumentUrlRef.current = null;
      setIsRendering(false);
      setError(null);
    }
    
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
      isRenderingRef.current = false;
    };
  }, [isOpen]);

  // Global mouse event handlers for drag and drop
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (dragState.isDragging && dragState.recipientId) {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = Math.round((event.clientX - rect.left) / zoom);
        const y = Math.round((event.clientY - rect.top) / zoom);

        setSignaturePositions(prev => 
          prev.map(pos => 
            pos.recipientId === dragState.recipientId 
              ? { ...pos, x, y }
              : pos
          )
        );
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

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragState.isDragging) return;
    
    if (currentSignerIndex === null) {
      toast({
        title: 'No signer selected',
        description: 'Please select a signer from the left panel first',
        variant: 'destructive'
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
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
    if (currentSignerIndex === null) {
      toast({
        title: 'No signer selected',
        description: 'Please select a signer from the left panel first',
        variant: 'destructive'
      });
      return;
    }

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
    setDragState({
      isDragging: true,
      recipientId,
      startX: event.clientX,
      startY: event.clientY
    });
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
                  disabled={currentPage <= 1 || isRendering}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Page
                </Button>
                <span className="text-sm px-3 py-1 bg-muted rounded">
                  Page {currentPage} of {totalPages}
                  {isRendering && " (Loading page...)"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages || isRendering}
                >
                  Next Page
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
                  disabled={zoom <= 0.5}
                >
                  Zoom Out
                </Button>
                <span className="text-sm px-2">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
                  disabled={zoom >= 3}
                >
                  Zoom In
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {currentSigner ? `Positioning for: ${currentSigner.name}` : 'Select a signer to position'}
              </div>
            </div>

            {/* PDF Canvas Container */}
            <div 
              ref={containerRef}
              className="flex-1 relative overflow-auto bg-white p-4"
            >
              {isLoadingPdf ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gray-200 p-8 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-2">❌</div>
                      <p className="text-gray-600">{error}</p>
                    </div>
                  </div>
                </div>
              ) : !documentUrl ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gray-200 p-8 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-gray-600">No document URL provided</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative flex justify-center">
                  {isRendering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading page {currentPage}...</p>
                      </div>
                    </div>
                  )}
                  <canvas
                    ref={canvasRef}
                    className="border border-gray-300 cursor-crosshair shadow-lg"
                    onClick={handleCanvasClick}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      opacity: isRendering ? 0.5 : 1
                    }}
                  />
                  
                  {/* Signature position overlays */}
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
                            left: position.x * zoom,
                            top: position.y * zoom,
                            width: 150 * zoom,
                            height: 50 * zoom,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: Math.max(10, 12 * zoom)
                          }}
                          onMouseDown={(e) => {
                            handleSignatureMouseDown(position.recipientId, e);
                          }}
                        >
                          {signer?.name || 'Unknown'} - Sign Here
                        </div>
                      );
                    })}
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