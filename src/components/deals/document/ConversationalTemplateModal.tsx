import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Send, MessageSquare, FileText, Save, X } from "lucide-react";
import { useConversationalDocGen } from '@/hooks/useConversationalDocGen';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface ConversationalTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: string;
  onDocumentSaved: () => void;
}

const ConversationalTemplateModal: React.FC<ConversationalTemplateModalProps> = ({
  isOpen,
  onClose,
  dealId,
  onDocumentSaved
}) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState('docx');
  const [customFileName, setCustomFileName] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    options,
    isLoading,
    isComplete,
    generatedDocument,
    disclaimer,
    sendMessage,
    selectOption,
    startConversation,
    reset
  } = useConversationalDocGen(dealId);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveDocument = async () => {
    if (!user || !generatedDocument) return;
    setIsSaving(true);

    try {
      const baseFileName = customFileName.trim() || `AI_Generated_Document_${Date.now()}`;
      const fileName = `${baseFileName}.${selectedFileType}`;
      const mimeType = selectedFileType === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      let contentBlob: Blob;

      if (selectedFileType === 'pdf') {
        const jsPDF = (await import('jspdf')).default;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margins = 20;
        const maxLineWidth = pageWidth - (margins * 2);
        const lines = generatedDocument.split('\n');
        let yPosition = margins;
        doc.setFontSize(10);
        
        lines.forEach((line) => {
          if (yPosition > doc.internal.pageSize.getHeight() - margins) {
            doc.addPage();
            yPosition = margins;
          }
          if (line.trim() === '') {
            yPosition += 7;
            return;
          }
          const wrappedLines = doc.splitTextToSize(line, maxLineWidth);
          wrappedLines.forEach((wrappedLine: string) => {
            if (yPosition > doc.internal.pageSize.getHeight() - margins) {
              doc.addPage();
              yPosition = margins;
            }
            doc.text(wrappedLine, margins, yPosition);
            yPosition += 7;
          });
        });
        contentBlob = doc.output('blob');
      } else {
        const lines = generatedDocument.split('\n');
        const paragraphs = lines.map(line => new Paragraph({ 
          children: [new TextRun({ text: line })] 
        }));
        const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
        contentBlob = await Packer.toBlob(doc);
      }

      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          deal_id: dealId,
          name: fileName,
          category: 'contract',
          uploaded_by: user.id,
          storage_path: `${dealId}/${fileName}`,
          size: contentBlob.size,
          type: mimeType,
          status: 'draft'
        })
        .select()
        .single();

      if (docError) throw docError;

      await supabase.from('document_versions').insert({
        document_id: document.id,
        version_number: 1,
        storage_path: `${dealId}/${fileName}`,
        size: contentBlob.size,
        type: mimeType,
        uploaded_by: user.id,
        description: 'AI-generated document via guided conversation'
      });

      await supabase.storage.from('deal_documents').upload(`${dealId}/${fileName}`, contentBlob);

      toast.success('Document saved successfully');
      await onDocumentSaved();
      handleClose();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    setInput('');
    setCustomFileName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Guided Document Generation
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${isComplete ? 'w-1/2' : 'w-full'}`}>
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Options */}
            {options.length > 0 && !isLoading && !isComplete && (
              <div className="px-6 pb-2">
                <div className="flex flex-wrap gap-2">
                  {options.map((opt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => selectOption(opt)}
                      className="text-xs"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            {!isComplete && (
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your response..."
                    disabled={isLoading}
                  />
                  <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Document Preview */}
          {isComplete && generatedDocument && (
            <div className="w-1/2 border-l flex flex-col">
              <div className="p-4 border-b space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">File Name</Label>
                    <Input
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder="Document name"
                      className="h-8"
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-xs">Format</Label>
                    <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="docx">DOCX</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <Textarea
                  value={generatedDocument}
                  readOnly
                  className="min-h-[400px] font-mono text-xs"
                />
                {disclaimer && (
                  <p className="text-xs text-muted-foreground mt-2 italic">{disclaimer}</p>
                )}
              </ScrollArea>

              <div className="p-4 border-t flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveDocument} disabled={isSaving} className="flex-1">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Document
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationalTemplateModal;
