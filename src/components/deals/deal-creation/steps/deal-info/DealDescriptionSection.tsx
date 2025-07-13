
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { DealCreationData } from '../../types';
import { useDocumentAI } from '@/hooks/document-ai/useDocumentAI';
import { toast } from 'sonner';

interface DealDescriptionSectionProps {
  data: DealCreationData;
  updateData: (updates: Partial<DealCreationData>) => void;
  error?: string;
  tempDealId?: string;
}

export const DealDescriptionSection: React.FC<DealDescriptionSectionProps> = ({
  data,
  updateData,
  error,
  tempDealId
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Initialize document AI hook for this temp deal
  const documentAI = useDocumentAI({ 
    dealId: tempDealId || 'temp-deal', 
    documentId: undefined 
  });

  const getDescriptionPlaceholder = () => {
    return `Describe your business and what makes it attractive to buyers. Include:
• What your business does
• How long you've been operating
• Key strengths and assets
• Growth opportunities
• Why this is a good investment`;
  };

  const handleAIGenerate = async () => {
    if (!data.businessTradingName && !data.businessLegalName) {
      toast.error('Please enter a business name first');
      return;
    }

    if (!data.businessIndustry) {
      toast.error('Please select a business industry first');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call the new AI-powered description generator
      const result = await documentAI.processAIRequest('generate_deal_description', {
        content: '',
        context: {
          tempDealId: tempDealId,
          dealData: {
            businessTradingName: data.businessTradingName,
            businessLegalName: data.businessLegalName,
            businessIndustry: data.businessIndustry,
            yearsInOperation: data.yearsInOperation,
            dealType: data.dealType,
            askingPrice: data.askingPrice,
            businessState: data.businessState,
            reasonForSelling: data.reasonForSelling
          },
          uploadedDocuments: data.uploadedDocuments || []
        }
      });

      if (result?.description) {
        updateData({ dealDescription: result.description });
        
        // Show helpful feedback about what data was used
        const documentsUsed = result.documentsAnalyzed || 0;
        if (documentsUsed > 0) {
          toast.success(`Generated description using ${documentsUsed} uploaded document${documentsUsed > 1 ? 's' : ''} for enhanced accuracy`);
        } else {
          toast.success('Generated description based on business information. Upload documents for more detailed suggestions.');
        }
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Failed to generate description. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="dealDescription">
          Deal Description *
        </Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={handleAIGenerate}
          disabled={isGenerating || (!data.businessTradingName && !data.businessLegalName) || !data.businessIndustry}
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          AI Suggest
        </Button>
      </div>
      <Textarea
        id="dealDescription"
        value={data.dealDescription}
        onChange={(e) => updateData({ dealDescription: e.target.value })}
        placeholder={getDescriptionPlaceholder()}
        rows={6}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
