
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useDocumentAI } from "@/hooks/document-ai/useDocumentAI";
import { useDocumentOperations } from "@/hooks/document-operations/useDocumentOperations";
import TemplateSelectionModal from "./TemplateSelectionModal";
import GeneratedDocumentReview from "./GeneratedDocumentReview";

interface SmartTemplateButtonProps {
  dealId: string;
  onDocumentSaved: () => void;
  userRole?: string;
}

const SmartTemplateButton: React.FC<SmartTemplateButtonProps> = ({ 
  dealId, 
  onDocumentSaved,
  userRole = 'user'
}) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const { generateTemplate, loading: isGenerating } = useDocumentAI({ dealId });
  const { saveGeneratedTemplate } = useDocumentOperations(dealId);
  
  // Check if user role allows template generation
  const canGenerateTemplates = ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase());
  
  if (!canGenerateTemplates) {
    return null;
  }
  
  const handleGenerateTemplate = async (templateType: string, requirements: string) => {
    try {
      const result = await generateTemplate(requirements, templateType);
      if (result?.template) {
        setGeneratedText(result.template);
        setShowTemplateModal(false);
        setShowReviewModal(true);
      } else {
        toast({
          title: "Template Generation Failed",
          description: "Could not generate the template. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Template generation error:", error);
      toast({
        title: "Template Generation Failed",
        description: error.message || "An error occurred while generating the template.",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveDocument = async (text: string, filename: string, category: string) => {
    setIsSaving(true);
    try {
      // Use the document operations hook to save the template
      await saveGeneratedTemplate(text, filename, category);
      
      toast({
        title: "Document Saved",
        description: `${filename} has been saved successfully.`,
      });
      
      setShowReviewModal(false);
      setGeneratedText('');
      
      // Notify parent component to refresh document list
      onDocumentSaved();
      
    } catch (error: any) {
      console.error("Save document error:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save the document.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setShowTemplateModal(true)}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Generate Template
      </Button>
      
      <TemplateSelectionModal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onGenerateTemplate={handleGenerateTemplate}
        isGenerating={isGenerating}
      />
      
      <GeneratedDocumentReview
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        initialText={generatedText}
        isSaving={isSaving}
        onSave={handleSaveDocument}
      />
    </>
  );
};

export default SmartTemplateButton;
