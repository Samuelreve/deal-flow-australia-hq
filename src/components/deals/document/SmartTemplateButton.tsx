
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SmartTemplateButtonProps {
  documentId?: string;
  dealId: string;
  onDocumentSaved: () => void;
  userRole: string;
}

const SmartTemplateButton = ({ documentId, dealId, onDocumentSaved, userRole }: SmartTemplateButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to generate templates",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
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
          content: `Generate a contract template for a ${deal.deal_type || 'business'} sale`,
          context: {
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

      // Create a new document with the generated content
      const templateContent = result.template || result.response || 'Generated template content';
      const fileName = `Generated_Contract_Template_${Date.now()}.txt`;
      
      // Create blob from template content
      const blob = new Blob([templateContent], { type: 'text/plain' });
      const file = new File([blob], fileName, { type: 'text/plain' });

      // Upload the generated template as a document
      const fileExt = fileName.split('.').pop();
      const filePath = `${dealId}/generated-${user.id}-${Date.now()}.${fileExt}`;

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
        title: "Template generated successfully",
        description: "A new contract template has been created and uploaded",
      });
      
      onDocumentSaved();
    } catch (error: any) {
      console.error("Error generating template:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate contract template",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Only certain roles should see this button
  if (!["admin", "seller"].includes(userRole?.toLowerCase())) {
    return null;
  }

  return (
    <Button
      onClick={handleGenerate}
      disabled={generating}
      variant="outline"
      size="sm"
      className="flex items-center"
    >
      {generating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileText className="mr-2 h-4 w-4" />
      )}
      {generating ? 'Generating...' : 'Smart Template'}
    </Button>
  );
};

export default SmartTemplateButton;
