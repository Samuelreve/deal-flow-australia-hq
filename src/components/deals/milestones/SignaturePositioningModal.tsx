import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MousePointer, Save, X, ZoomIn, ZoomOut } from 'lucide-react';

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
  const [currentSignerIndex, setCurrentSignerIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize signature positions
  useEffect(() => {
    if (isOpen && signers.length > 0) {
      const initialPositions = signers.map((signer, index) => ({
        x: 100,
        y: 200 + (index * 100),
        page: 1,
        recipientId: signer.recipientId,
        recipientName: signer.name
      }));
      setSignaturePositions(initialPositions);
      setCurrentSignerIndex(0);
    }
  }, [isOpen, signers]);

  const handleDocumentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;

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
          y
        };
      } else {
        newPositions.push({
          x,
          y,
          page: 1,
          recipientId: currentSigner.recipientId,
          recipientName: currentSigner.name
        });
      }

      return newPositions;
    });

    toast({
      title: 'Signature position set',
      description: `Position set for ${currentSigner.name} at (${x}, ${y})`,
    });
  };

  const handleSignatureDrag = (recipientId: string, event: React.MouseEvent) => {
    if (!isDragging) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) / zoom);
    const y = Math.round((event.clientY - rect.top) / zoom);

    setSignaturePositions(prev =>
      prev.map(pos =>
        pos.recipientId === recipientId
          ? { ...pos, x, y }
          : pos
      )
    );
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

  const currentSigner = signers[currentSignerIndex];
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

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Zoom Controls</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2 py-1 bg-muted rounded">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Document Preview */}
          <div className="flex-1 overflow-auto bg-gray-100">
            <div 
              ref={containerRef}
              className="relative cursor-crosshair border rounded-lg min-h-[600px] bg-white"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                width: `${100/zoom}%`,
                height: `${600/zoom}px`
              }}
              onClick={handleDocumentClick}
            >
              {/* Document preview using Google Docs viewer */}
              {documentUrl ? (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(documentUrl)}&embedded=true`}
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title="Document Preview"
                  allow="fullscreen"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gray-200 p-8 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-gray-600">Loading document...</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Overlay for click handling */}
              <div 
                className="absolute inset-0 bg-transparent cursor-crosshair"
                onClick={handleDocumentClick}
              />

              {/* Render signature position indicators */}
              {signaturePositions.map((position) => {
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
                      setIsDragging(true);
                      e.stopPropagation();
                    }}
                    onMouseMove={(e) => {
                      if (isDragging) {
                        handleSignatureDrag(position.recipientId, e);
                      }
                    }}
                    onMouseUp={() => setIsDragging(false)}
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