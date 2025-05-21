import React, { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useDocumentAI } from "@/hooks/useDocumentAI";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface SmartTemplateButtonProps {
  requirements: string;
}

const SmartTemplateButton = ({ requirements }: SmartTemplateButtonProps) => {
  const [generatedTemplate, setGeneratedTemplate] = useState<string>('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { generateTemplate } = useDocumentAI({ dealId: '' });
  const { toast } = useToast();

  const handleGenerateTemplate = async () => {
    if (!requirements || requirements.trim() === '') {
      toast({
        title: "Error",
        description: "Please provide template requirements",
        variant: "destructive"
      });
      return;
    }
    
    setGenerating(true);
    setError(null);
    
    try {
      // Fix: Pass only 1 argument as expected
      const result = await generateTemplate(requirements);
      
      if (result?.template) {
        setGeneratedTemplate(result.template);
        setShowReviewDialog(true);
      } else {
        throw new Error("Failed to generate template");
      }
    } catch (err: any) {
      console.error("Error generating template:", err);
      setError(err.message || "An error occurred while generating the template");
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to generate template",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Button onClick={handleGenerateTemplate} disabled={generating}>
        {generating ? "Generating..." : "Generate Template"}
      </Button>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Generated Template</DialogTitle>
            <DialogDescription>
              Review the generated template and make any necessary adjustments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Textarea
                value={generatedTemplate}
                readOnly
                className="col-span-4"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SmartTemplateButton;
