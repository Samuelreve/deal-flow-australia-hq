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
  // Fallback data when no document is available
  businessData?: {
    businessTradingName?: string;
    dealType?: string;
    businessIndustry?: string;
    yearsInOperation?: number;
  };
}

export const AIDocumentSuggestion: React.FC<AIDocumentSuggestionProps> = ({
  documentText,
  extractedData,
  fieldType,
  currentValue,
  onSuggestion,
  dealCategory = 'business_sale',
  businessData
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateSuggestion = async () => {
    // If we have document data, use AI suggestion
    if (documentText || extractedData) {
      return await generateAISuggestion();
    }
    
    // Fallback to basic generation for title if no document data
    if (fieldType === 'title' && businessData) {
      return generateBasicTitle();
    }
    
    // Fallback to basic generation for description if no document data
    if (fieldType === 'description' && businessData) {
      return generateBasicDescription();
    }

    toast({
      title: "No Data Available",
      description: "Please upload a document or fill in basic business information first",
      variant: "destructive"
    });
  };

  const generateAISuggestion = async () => {
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

  const generateBasicTitle = () => {
    if (businessData?.businessTradingName && businessData?.dealType) {
      const title = `Sale of ${businessData.businessTradingName} - ${businessData.dealType}`;
      onSuggestion(title);
      toast({
        title: "Title Generated",
        description: "Generated basic title from business information",
      });
    }
  };

  const generateBasicDescription = () => {
    if (businessData?.businessTradingName && businessData?.businessIndustry) {
      const suggestion = `Established ${businessData.businessIndustry.toLowerCase()} business offering excellent growth opportunities. ${businessData.businessTradingName} has built a strong reputation and customer base over ${businessData.yearsInOperation || 'several'} years of operation.

Key Features:
• Proven business model with consistent revenue
• Strong market position in ${businessData.businessIndustry.toLowerCase()}
• Experienced team and established operations
• Excellent opportunity for growth and expansion

This ${businessData.dealType?.toLowerCase() || 'business sale'} represents a rare opportunity to acquire a well-established business with significant potential for the right buyer.`;
      
      onSuggestion(suggestion);
      toast({
        title: "Description Generated",
        description: "Generated basic description from business information",
      });
    }
  };

  const getButtonText = () => {
    const hasDocumentData = !!(documentText || extractedData);
    const prefix = hasDocumentData ? 'AI' : 'Auto';
    
    switch (fieldType) {
      case 'title': return hasDocumentData ? 'AI Suggest' : 'Auto-generate';
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
      disabled={isGenerating || (!documentText && !extractedData && !businessData?.businessTradingName)}
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