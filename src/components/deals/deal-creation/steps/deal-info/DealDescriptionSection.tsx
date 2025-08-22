
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DealCreationData } from '../../types';
import { AIDocumentSuggestion } from '../../components/AIDocumentSuggestion';

interface DealDescriptionSectionProps {
  data: DealCreationData;
  updateData: (updates: Partial<DealCreationData>) => void;
  error?: string;
  documentText?: string;
  extractedData?: any;
}

export const DealDescriptionSection: React.FC<DealDescriptionSectionProps> = ({
  data,
  updateData,
  error,
  documentText,
  extractedData
}) => {
  const getDescriptionPlaceholder = () => {
    return `Describe your business and what makes it attractive to buyers. Include:
• What your business does
• How long you've been operating
• Key strengths and assets
• Growth opportunities
• Why this is a good investment`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="dealDescription">
          Deal Description *
        </Label>
        <AIDocumentSuggestion
          documentText={documentText}
          extractedData={extractedData}
          fieldType="description"
          currentValue={data.dealDescription}
          onSuggestion={(suggestion) => updateData({ dealDescription: suggestion })}
          dealCategory={data.dealCategory}
        />
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
