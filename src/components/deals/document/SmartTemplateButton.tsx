
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useDocumentAI } from "@/hooks/useDocumentAI";
import { useToast } from "@/components/ui/use-toast";

export interface SmartTemplateButtonProps {
  documentId?: string;
  dealId: string;
  onDocumentSaved: () => void;
  userRole: string;
}

const SmartTemplateButton = ({ documentId, dealId, onDocumentSaved, userRole }: SmartTemplateButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const { generateSmartTemplate } = useDocumentAI({ dealId, documentId });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateSmartTemplate();
      toast({
        title: "Contract template generated",
        description: "A new contract has been created based on deal data",
      });
      onDocumentSaved();
    } catch (error) {
      console.error("Error generating template:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate contract template",
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
      Smart Template
    </Button>
  );
};

export default SmartTemplateButton;
