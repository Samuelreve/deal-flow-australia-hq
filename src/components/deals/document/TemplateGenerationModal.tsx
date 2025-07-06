import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TemplateGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: string;
  onDocumentSaved: () => void;
}

const TemplateGenerationModal: React.FC<TemplateGenerationModalProps> = ({
  isOpen,
  onClose,
  dealId,
  onDocumentSaved
}) => {
  const [templateType, setTemplateType] = useState('Contract');
  const [requirements, setRequirements] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [disclaimer, setDisclaimer] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('txt');
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
      // Get deal information for context
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();

      if (dealError) {
        throw new Error('Failed to fetch deal information');
      }

      // Call the document AI assistant edge function
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
      // Create file name based on selected type
      const fileName = `Generated_${templateType.replace(/\s+/g, '_')}_${Date.now()}.${selectedFileType}`;
      
      // Create different content based on file type
      let fileContent: string | Uint8Array;
      let mimeType: string;
      
      switch (selectedFileType) {
        case 'txt':
          fileContent = generatedTemplate;
          mimeType = 'text/plain';
          break;
        case 'rtf':
          // Create basic RTF format
          fileContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ${generatedTemplate.replace(/\n/g, '\\par ')}}`;
          mimeType = 'application/rtf';
          break;
        case 'pdf':
          // For PDF, we'll save as text for now (would need a PDF library for proper PDF generation)
          fileContent = generatedTemplate;
          mimeType = 'application/pdf';
          break;
        case 'docx':
          // For DOCX, we'll save as text for now (would need a library for proper DOCX generation)
          fileContent = generatedTemplate;
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        default:
          fileContent = generatedTemplate;
          mimeType = 'text/plain';
      }
      
      // Create blob from template content
      const blob = new Blob([fileContent], { type: mimeType });
      const file = new File([blob], fileName, { type: mimeType });

      // Upload the generated template as a document
      const filePath = `${dealId}/generated-${user.id}-${Date.now()}.${selectedFileType}`;

      const { error: uploadError } = await supabase.storage
        .from('deal-documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Create document record
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          deal_id: dealId,
          name: fileName,
          type: file.type,
          size: file.size,
          category: 'contract',
          uploaded_by: user.id,
          storage_path: filePath,
          status: 'draft'
        })
        .select()
        .single();

      if (docError) {
        throw docError;
      }

      // Create document version
      await supabase
        .from('document_versions')
        .insert({
          document_id: document.id,
          version_number: 1,
          size: file.size,
          type: file.type,
          storage_path: filePath,
          uploaded_by: user.id
        });

      toast({
        title: "Template saved successfully",
        description: `The generated template has been saved as ${selectedFileType.toUpperCase()} and added to your documents`,
      });
      
      // Refresh the documents list first, then close the modal
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
    setTemplateType('Contract');
    setRequirements('');
    setGeneratedTemplate('');
    setDisclaimer('');
    setSelectedFileType('txt');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate AI Template</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {!generatedTemplate ? (
            // Generation form
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
                      <SelectItem value="txt">Text File (.txt)</SelectItem>
                      <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                      <SelectItem value="docx">Word Document (.docx)</SelectItem>
                      <SelectItem value="rtf">Rich Text Format (.rtf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
          {!generatedTemplate ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
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