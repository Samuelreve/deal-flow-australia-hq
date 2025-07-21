import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TextSignaturePosition {
  line: number;
  column: number;
  recipientId: string;
  recipientName: string;
}

interface TextSignaturePositioningProps {
  documentContent: string;
  signers: Array<{
    email: string;
    name: string;
    recipientId: string;
  }>;
  onPositionsChange: (positions: TextSignaturePosition[]) => void;
}

const TextSignaturePositioning: React.FC<TextSignaturePositioningProps> = ({
  documentContent,
  signers,
  onPositionsChange
}) => {
  const [signaturePositions, setSignaturePositions] = useState<TextSignaturePosition[]>([]);
  const [currentSignerIndex, setCurrentSignerIndex] = useState<number | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  // Split content into lines
  useEffect(() => {
    const textLines = documentContent.split('\n');
    setLines(textLines);
  }, [documentContent]);

  // Initialize signature positions
  useEffect(() => {
    if (signers.length > 0) {
      const initialPositions = signers.map((signer, index) => ({
        line: Math.min(5 + index * 3, lines.length - 1),
        column: 0,
        recipientId: signer.recipientId,
        recipientName: signer.name
      }));
      setSignaturePositions(initialPositions);
      onPositionsChange(initialPositions);
    }
  }, [signers, lines.length, onPositionsChange]);

  const handleLineClick = (lineIndex: number) => {
    if (currentSignerIndex === null) {
      toast({
        title: 'No signer selected',
        description: 'Please select a signer from the list first',
        variant: 'destructive'
      });
      return;
    }

    const currentSigner = signers[currentSignerIndex];
    if (!currentSigner) return;

    const newPositions = [...signaturePositions];
    const existingIndex = newPositions.findIndex(
      p => p.recipientId === currentSigner.recipientId
    );

    const newPosition = {
      line: lineIndex,
      column: 0,
      recipientId: currentSigner.recipientId,
      recipientName: currentSigner.name
    };

    if (existingIndex >= 0) {
      newPositions[existingIndex] = newPosition;
    } else {
      newPositions.push(newPosition);
    }

    setSignaturePositions(newPositions);
    onPositionsChange(newPositions);

    toast({
      title: 'Signature position set',
      description: `Position set for ${currentSigner.name} at line ${lineIndex + 1}`,
    });
  };

  const currentSigner = currentSignerIndex !== null ? signers[currentSignerIndex] : null;

  return (
    <div className="flex gap-4 h-full">
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
                      Line: {position.line + 1}
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
              Click on any line to set the signature position
            </p>
          </div>
        )}
      </div>

      {/* Right Panel - Text Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Text Document - Click on lines to position signatures
          </p>
        </div>
        
        <div 
          ref={contentRef}
          className="flex-1 overflow-auto p-4 bg-white font-mono text-sm"
        >
          {lines.map((line, lineIndex) => {
            const hasSignature = signaturePositions.some(pos => pos.line === lineIndex);
            const signatureForLine = signaturePositions.find(pos => pos.line === lineIndex);
            
            return (
              <div
                key={lineIndex}
                className={`relative py-1 px-2 cursor-pointer hover:bg-muted/30 border-l-2 ${
                  hasSignature ? 'border-l-primary bg-primary/5' : 'border-l-transparent'
                }`}
                onClick={() => handleLineClick(lineIndex)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs w-8 select-none">
                    {lineIndex + 1}
                  </span>
                  <span className="whitespace-pre-wrap">{line}</span>
                  {signatureForLine && (
                    <span className="ml-2 px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                      📝 {signatureForLine.recipientName}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TextSignaturePositioning;