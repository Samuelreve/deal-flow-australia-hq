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
import { getDocumentTypeForSigning } from '@/utils/fileUtils';
import { supabase } from '@/integrations/supabase/client';
import TextSignaturePositioning from './TextSignaturePositioning';
// DocxPageViewer no longer needed - DocuSign converts DOCX internally

// Configure PDF.js worker - use local worker file with matching version
PDFJS.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

interface SignaturePosition {
  x: number;
  y: number;
  page: number;
  recipientId: string;
  recipientName: string;
}

interface TextSignaturePosition {
  line: number;
  column: number;
  recipientId: string;
  recipientName: string;
}

interface SignaturePositioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (positions: SignaturePosition[] | TextSignaturePosition[]) => void;
  documentUrl: string;
  documentFilename?: string;
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
  documentFilename,
  signers,
  isLoading = false
}) => {
  const [signaturePositions, setSignaturePositions] = useState<SignaturePosition[]>([]);
  const [textSignaturePositions, setTextSignaturePositions] = useState<TextSignaturePosition[]>([]);
  const [currentSignerIndex, setCurrentSignerIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'pdf' | 'text' | 'convertible'>('pdf');
  const [documentContent, setDocumentContent] = useState<string>('');
  const [isDocxFile, setIsDocxFile] = useState(false);
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

  // Determine document type
  useEffect(() => {
    if (documentFilename) {
      const type = getDocumentTypeForSigning(documentFilename);
      setDocumentType(type);
      const ext = documentFilename.split('.').pop()?.toLowerCase() || '';
      setIsDocxFile(['docx', 'doc'].includes(ext));
    }
  }, [documentFilename]);

  // Initialize signature positions
  useEffect(() => {
    if (isOpen && signers.length > 0) {
      if (documentType === 'text') {
        // Text positions will be initialized in TextSignaturePositioning component
        setTextSignaturePositions([]);
      } else {
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
      }
      setCurrentSignerIndex(null);
    }
  }, [isOpen, signers, documentType]);

  // No DOCX conversion needed - DocuSign converts DOCX to PDF internally

  // Load document based on type
  useEffect(() => {
    if (!documentUrl || !isOpen) return;
    if (loadedDocumentUrlRef.current === documentUrl) return; // Already loaded

    loadedDocumentUrlRef.current = documentUrl;
    setError(null);

    if (documentType === 'text') {
      // Load text content
      setIsLoadingPdf(true);
      fetch(documentUrl)
        .then(response => response.text())
        .then(text => {
          setDocumentContent(text);
          setIsLoadingPdf(false);
        })
        .catch(error => {
          console.error('Text loading error:', error);
          setError('Failed to load text document');
          setIsLoadingPdf(false);
          loadedDocumentUrlRef.current = null;
        });
    } else if (isDocxFile) {
      // DOCX files - just show placeholder, DocuSign converts internally
      setIsLoadingPdf(false);
      setTotalPages(1);
      setCurrentPage(1);
    } else {
      // Load PDF document - fetch as ArrayBuffer first to avoid CORS issues
      console.log(`Loading PDF document: ${documentUrl}`);
      setIsLoadingPdf(true);
      
      const loadPdf = async () => {
        try {
          const response = await fetch(documentUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          
          const loadingTask = PDFJS.getDocument({ data: arrayBuffer });
          const loadedDoc = await loadingTask.promise;
          
          setPdfDocument(loadedDoc);
          setTotalPages(loadedDoc.numPages);
          setCurrentPage(1);
          setIsLoadingPdf(false);
          console.log(`✅ PDF metadata loaded - ${loadedDoc.numPages} pages available`);
        } catch (error) {
          console.error('PDF loading error:', error);
          setError('Failed to load PDF document');
          setIsLoadingPdf(false);
          loadedDocumentUrlRef.current = null;
          toast({
            title: 'Error loading PDF',
            description: error instanceof Error ? error.message : 'Failed to load PDF document',
            variant: 'destructive'
          });
        }
      };
      
      loadPdf();
    }
  }, [documentUrl, isOpen, documentType, isDocxFile, toast]);

  // Render ONLY the current page when page changes - with proper synchronization
  useEffect(() => {
    if (!pdfDocument || !currentPage || documentType === 'text') return;

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

  const handleCanvasClick = (event: React.MouseEvent<HTMLElement>) => {
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
    if (documentType === 'text') {
      if (textSignaturePositions.length !== signers.length) {
        toast({
          title: 'Missing signature positions',
          description: 'Please set signature positions for all signers',
          variant: 'destructive'
        });
        return;
      }
      onConfirm(textSignaturePositions);
    } else {
      if (signaturePositions.length !== signers.length) {
        toast({
          title: 'Missing signature positions',
          description: 'Please set signature positions for all signers',
          variant: 'destructive'
        });
        return;
      }
      onConfirm(signaturePositions);
    }
  };

  const handleTextPositionsChange = (positions: TextSignaturePosition[]) => {
    setTextSignaturePositions(positions);
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
            {documentType === 'text' 
              ? 'Click on text lines to position signature fields for each signer'
              : isDocxFile
              ? 'Position signature fields below. DocuSign will convert this document to PDF automatically.'
              : 'Click on the document to position signature fields for each signer'
            }
          </p>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {documentType === 'text' ? (
            <TextSignaturePositioning
              documentContent={documentContent}
              signers={signers}
              onPositionsChange={handleTextPositionsChange}
            />
          ) : (
            <>
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

                {/* PDF Canvas Container or DOCX Viewer */}
                <div 
                  ref={containerRef}
                  className="flex-1 relative overflow-auto bg-white"
                >
                  {isLoadingPdf ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-muted-foreground">Loading document...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-muted p-8 rounded-lg">
                        <div className="text-center">
                          <div className="text-4xl mb-2">❌</div>
                          <p className="text-muted-foreground">{error}</p>
                        </div>
                      </div>
                    </div>
                  ) : isDocxFile && !pdfDocument ? (
                    /* DOCX placeholder - DocuSign converts internally */
                    <div className="relative p-4">
                      <div
                        className="border border-border shadow-lg bg-background cursor-crosshair mx-auto"
                        style={{ width: 595 * zoom, height: 842 * zoom, transformOrigin: 'top left' }}
                        onClick={handleCanvasClick}
                      >
                        <div className="p-8 text-center text-muted-foreground" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                          <div className="text-4xl mb-4">📄</div>
                          <p className="font-medium text-lg">{documentFilename}</p>
                          <p className="text-sm mt-2">Click to position signatures</p>
                          <p className="text-xs mt-1">DocuSign will convert this document to PDF</p>
                        </div>
                      </div>
                      {/* Signature position overlays */}
                      {signaturePositions
                        .filter(pos => pos.page === currentPage)
                        .map((position) => (
                          <div
                            key={position.recipientId}
                            className="absolute bg-primary/20 border-2 border-primary rounded flex items-center justify-center text-xs font-medium text-primary cursor-move z-10"
                            style={{
                              left: position.x * zoom + 16,
                              top: position.y * zoom + 16,
                              width: 120 * zoom,
                              height: 40 * zoom,
                            }}
                            onMouseDown={(e) => handleSignatureMouseDown(position.recipientId, e)}
                          >
                            📝 {position.recipientName}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="relative p-4">
                      <canvas
                        ref={canvasRef}
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                        className="border border-gray-300 shadow-lg max-w-full cursor-crosshair"
                        onClick={handleCanvasClick}
                      />
                      
                      {/* Signature position overlays */}
                      {signaturePositions
                        .filter(pos => pos.page === currentPage)
                        .map((position) => (
                          <div
                            key={position.recipientId}
                            className="absolute bg-blue-500 bg-opacity-20 border-2 border-blue-500 rounded flex items-center justify-center text-xs font-medium text-blue-800 cursor-move z-10"
                            style={{
                              left: position.x * zoom,
                              top: position.y * zoom,
                              width: 120 * zoom,
                              height: 40 * zoom,
                              transform: 'translate(0, 0)'
                            }}
                            onMouseDown={(e) => handleSignatureMouseDown(position.recipientId, e)}
                          >
                            📝 {position.recipientName}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading || (documentType !== 'text' && isLoadingPdf)}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Processing...' : 'Confirm Positions'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignaturePositioningModal;