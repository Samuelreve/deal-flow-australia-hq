import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X, Zap, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ConversationalTemplateModal from './ConversationalTemplateModal';

interface TemplateGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: string;
  onDocumentSaved: () => void;
}

type GenerationMode = 'select' | 'quick' | 'guided';

const TemplateGenerationModal: React.FC<TemplateGenerationModalProps> = ({
  isOpen,
  onClose,
  dealId,
  onDocumentSaved
}) => {
  const [mode, setMode] = useState<GenerationMode>('select');
  const [templateType, setTemplateType] = useState('Contract');
  const [requirements, setRequirements] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [disclaimer, setDisclaimer] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('docx');
  const [customFileName, setCustomFileName] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const templateTypes = [
    'Contract',
    'Agreement',
    'Terms and Conditions',
    'Privacy Policy',
    'Service Agreement',
    'Employment Contract',
    'Non-Disclosure Agreement'
  ];

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to generate templates",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();

      if (dealError) {
        throw new Error('Failed to fetch deal information');
      }

      const { data: result, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'generate_template',
          content: requirements || `Generate a ${templateType} template`,
          dealId: dealId,
          userId: user.id,
          context: {
            templateType: templateType,
            dealTitle: deal.title,
            businessName: deal.business_legal_name,
            askingPrice: deal.asking_price,
            dealType: deal.deal_type,
            businessIndustry: deal.business_industry
          }
        }
      });

      if (error) {
        console.error('AI generation error:', error);
        throw new Error('Failed to generate template');
      }

      if (result?.success) {
        setGeneratedTemplate(result.template);
        setDisclaimer(result.disclaimer || '');
        setCustomFileName(`${templateType.replace(/\s+/g, '_')}_Template`);
        toast({
          title: "Template generated successfully",
          description: "You can now review and edit the template before saving",
        });
      } else {
        throw new Error(result?.error || 'Failed to generate template');
      }
    } catch (error: any) {
      console.error("Error generating template:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate template",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user || !generatedTemplate) return;

    setIsSaving(true);
    try {
      const baseFileName = customFileName.trim() || `Generated_${templateType.replace(/\s+/g, '_')}_${Date.now()}`;
      const fileName = `${baseFileName}.${selectedFileType}`;
      
      const getMimeType = (extension: string) => {
        switch (extension) {
          case 'pdf':
            return 'application/pdf';
          case 'docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          default:
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
      };

      const mimeType = getMimeType(selectedFileType);
      let contentBlob: Blob;

      if (selectedFileType === 'pdf') {
        const jsPDF = (await import('jspdf')).default;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margins = 20;
        const maxLineWidth = pageWidth - (margins * 2);
        
        const lines = generatedTemplate.split('\n');
        let yPosition = margins;
        const lineHeight = 7;
        
        doc.setFontSize(10);
        
        lines.forEach((line) => {
          if (yPosition > doc.internal.pageSize.getHeight() - margins) {
            doc.addPage();
            yPosition = margins;
          }
          
          if (line.trim() === '') {
            yPosition += lineHeight;
            return;
          }
          
          const wrappedLines = doc.splitTextToSize(line, maxLineWidth);
          wrappedLines.forEach((wrappedLine: string) => {
            if (yPosition > doc.internal.pageSize.getHeight() - margins) {
              doc.addPage();
              yPosition = margins;
            }
            doc.text(wrappedLine, margins, yPosition);
            yPosition += lineHeight;
          });
        });
        
        contentBlob = doc.output('blob');
      } else {
        const { Document, Packer, Paragraph, TextRun } = await import('docx');
        
        const lines = generatedTemplate.split('\n');
        const paragraphs: any[] = [];
        
        lines.forEach((line) => {
          const trimmedLine = line.trim();
          
          if (trimmedLine === '') {
            paragraphs.push(new Paragraph({ text: '' }));
            return;
          }
          
          const textRuns: any[] = [];
          const parts = trimmedLine.split(/(\b[A-Z]{2,}\b)/);
          parts.forEach((part) => {
            if (/^[A-Z]{2,}$/.test(part)) {
              textRuns.push(new TextRun({ text: part, bold: true }));
            } else {
              textRuns.push(new TextRun({ text: part }));
            }
          });
          
          paragraphs.push(new Paragraph({ children: textRuns }));
        });
        
        const doc = new Document({
          sections: [{ properties: {}, children: paragraphs }],
        });
        
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

      const { error: versionError } = await supabase
        .from('document_versions')
        .insert({
          document_id: document.id,
          version_number: 1,
          storage_path: `${dealId}/${fileName}`,
          size: contentBlob.size,
          type: mimeType,
          uploaded_by: user.id,
          description: 'AI-generated template document'
        });

      if (versionError) throw versionError;

      const { error: uploadError } = await supabase.storage
        .from('deal_documents')
        .upload(`${dealId}/${fileName}`, contentBlob);

      if (uploadError) throw uploadError;

      toast({
        title: "Template saved successfully",
        description: `The generated template has been saved as ${selectedFileType.toUpperCase()} file and added to your documents`,
      });
      
      await onDocumentSaved();
      handleClose();
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setMode('select');
    setTemplateType('Contract');
    setRequirements('');
    setGeneratedTemplate('');
    setDisclaimer('');
    setSelectedFileType('docx');
    setCustomFileName('');
    onClose();
  };

  // Render Guided Generation mode using ConversationalTemplateModal
  if (mode === 'guided') {
    return (
      <ConversationalTemplateModal
        isOpen={isOpen}
        onClose={handleClose}
        dealId={dealId}
        onDocumentSaved={onDocumentSaved}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === 'select' ? 'Generate AI Template' : 'Quick Generate Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {mode === 'select' ? (
            // Mode selection screen
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <button
                onClick={() => setMode('quick')}
                className="group p-6 border rounded-lg hover:border-primary hover:bg-accent/50 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Quick Generate</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Select a template type and add optional requirements. Best for simple documents when you know exactly what you need.
                </p>
                <ul className="mt-3 text-xs text-muted-foreground space-y-1">
                  <li>• Fastest option</li>
                  <li>• Form-based input</li>
                  <li>• Good for standard documents</li>
                </ul>
              </button>

              <button
                onClick={() => setMode('guided')}
                className="group p-6 border rounded-lg hover:border-primary hover:bg-accent/50 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Guided Generation</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  AI asks smart questions to understand your needs and generates a tailored document. Best for complex documents.
                </p>
                <ul className="mt-3 text-xs text-muted-foreground space-y-1">
                  <li>• Conversational interface</li>
                  <li>• Tailored recommendations</li>
                  <li>• Higher quality results</li>
                </ul>
              </button>
            </div>
          ) : !generatedTemplate ? (
            // Quick Generate form
            <div className="space-y-4">
              <div>
                <Label htmlFor="templateType">Template Type</Label>
                <Select value={templateType} onValueChange={setTemplateType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="requirements">Custom Requirements (Optional)</Label>
                <Textarea
                  id="requirements"
                  placeholder="Describe any specific requirements or clauses you want included in the template..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          ) : (
            // Template editor
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="generatedTemplate">Generated Template</Label>
                </div>
                <div>
                  <Label htmlFor="fileType">File Type</Label>
                  <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="docx">Word Document (.docx)</SelectItem>
                      <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="fileName">File Name</Label>
                <Input
                  id="fileName"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="Enter filename (without extension)"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  File will be saved as: {customFileName || 'Generated_Template'}.{selectedFileType}
                </p>
              </div>
              
              <div>
                <Textarea
                  id="generatedTemplate"
                  value={generatedTemplate}
                  onChange={(e) => setGeneratedTemplate(e.target.value)}
                  rows={18}
                  className="font-mono text-sm"
                />
              </div>
              
              {disclaimer && (
                <div className="text-xs text-muted-foreground italic p-3 bg-muted/50 rounded">
                  {disclaimer}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {mode === 'select' ? (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          ) : !generatedTemplate ? (
            <>
              <Button variant="outline" onClick={() => setMode('select')}>
                Back
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Template'
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setGeneratedTemplate('')}>
                <X className="mr-2 h-4 w-4" />
                Discard
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save and Upload Template
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateGenerationModal;