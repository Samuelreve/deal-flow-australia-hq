
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DealCreationData } from '../../types';
import { AIDocumentSuggestion } from '../../components/AIDocumentSuggestion';

interface DealTitleSectionProps {
  data: DealCreationData;
  updateData: (updates: Partial<DealCreationData>) => void;
  error?: string;
  documentText?: string;
  extractedData?: any;
}

export const DealTitleSection: React.FC<DealTitleSectionProps> = ({
  data,
  updateData,
  error,
  documentText,
  extractedData
}) => {
  const generateDealTitle = () => {
    if (data.businessTradingName && data.dealType) {
      const title = `Sale of ${data.businessTradingName} - ${data.dealType}`;
      updateData({ dealTitle: title });
    }
  };

  return (
    <div className="md:col-span-2 space-y-2">
      <Label htmlFor="dealTitle">
        Deal Title *
      </Label>
      <div className="flex space-x-2">
        <Input
          id="dealTitle"
          value={data.dealTitle}
          onChange={(e) => updateData({ dealTitle: e.target.value })}
          placeholder="e.g., Sale of Smith's Bakery - Asset Sale"
          className={`flex-1 ${error ? 'border-red-500' : ''}`}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={generateDealTitle}
          disabled={!data.businessTradingName || !data.dealType}
        >
          Auto-generate
        </Button>
        <AIDocumentSuggestion
          documentText={documentText}
          extractedData={extractedData}
          fieldType="title"
          currentValue={data.dealTitle}
          onSuggestion={(suggestion) => updateData({ dealTitle: suggestion })}
          dealCategory={data.dealCategory}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
