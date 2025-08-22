import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AIDocumentSuggestionProps {
  documentText?: string;
  extractedData?: any;
  fieldType: 'title' | 'description' | 'valuation' | 'assets';
  currentValue?: string;
  onSuggestion: (suggestion: string) => void;
  dealCategory?: string;
}

export const AIDocumentSuggestion: React.FC<AIDocumentSuggestionProps> = ({
  documentText,
  extractedData,
  fieldType,
  currentValue,
  onSuggestion,
  dealCategory = 'business_sale'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateSuggestion = async () => {
    if (!documentText && !extractedData) {
      toast({
        title: "No Document Data",
        description: "Please upload a document first to get AI suggestions",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-document-suggestion', {
        body: {
          documentText: documentText || '',
          extractedData: extractedData || {},
          fieldType,
          currentValue: currentValue || '',
          dealCategory
        }
      });

      if (error) throw error;

      if (data.suggestion) {
        onSuggestion(data.suggestion);
        toast({
          title: "AI Suggestion Generated",
          description: `Generated ${fieldType} suggestion based on your document`,
        });
      }
    } catch (error: any) {
      console.error('AI suggestion error:', error);
      toast({
        title: "AI Suggestion Failed",
        description: error.message || "Failed to generate suggestion",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonText = () => {
    switch (fieldType) {
      case 'title': return 'AI Suggest Title';
      case 'description': return 'AI Suggest';
      case 'valuation': return 'AI Valuation';
      case 'assets': return 'AI Suggest Assets';
      default: return 'AI Suggest';
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={generateSuggestion}
      disabled={isGenerating || (!documentText && !extractedData)}
      className="gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {isGenerating ? 'Generating...' : getButtonText()}
    </Button>
  );
};