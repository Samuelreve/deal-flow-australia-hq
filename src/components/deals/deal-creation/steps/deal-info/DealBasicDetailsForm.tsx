
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DealCreationData, DEAL_TYPES, SELLING_REASONS } from '../../types';
import { AIDocumentSuggestion } from '../../components/AIDocumentSuggestion';

interface DealBasicDetailsFormProps {
  data: DealCreationData;
  updateData: (updates: Partial<DealCreationData>) => void;
  errors: Record<string, string>;
  documentText?: string;
  extractedData?: any;
}

export const DealBasicDetailsForm: React.FC<DealBasicDetailsFormProps> = ({
  data,
  updateData,
  errors,
  documentText,
  extractedData
}) => {
  const formatPrice = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="askingPrice">
            Asking Price (Optional)
          </Label>
          <AIDocumentSuggestion
            documentText={documentText}
            extractedData={extractedData}
            fieldType="valuation"
            currentValue={data.askingPrice}
            onSuggestion={(suggestion) => {
              // Extract price from suggestion if possible, otherwise show as tip
              const priceMatch = suggestion.match(/\$[\d,]+/);
              if (priceMatch) {
                updateData({ askingPrice: priceMatch[0].replace('$', '').replace(/,/g, '') });
              }
            }}
            dealCategory={data.dealCategory}
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
          <Input
            id="askingPrice"
            value={data.askingPrice}
            onChange={(e) => updateData({ askingPrice: formatPrice(e.target.value) })}
            placeholder="400,000"
            className="pl-8"
          />
        </div>
        {extractedData?.businessInfo?.yearsInOperation && (
          <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full mt-0.5"></div>
            <div className="text-sm text-blue-800">
              <strong>AI Valuation Tip:</strong> Based on {data.businessIndustry || 'business'} with {extractedData.businessInfo.yearsInOperation} years of operation, typical asking prices range from 2-5x annual revenue. Consider getting a professional valuation.
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          You can set this as 'Price on Application' or provide a range
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetCompletionDate">
          Target Completion Date
        </Label>
        <Input
          id="targetCompletionDate"
          type="date"
          value={data.targetCompletionDate}
          onChange={(e) => updateData({ targetCompletionDate: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reasonForSelling">
          Reason for Selling
        </Label>
        <Select 
          value={data.reasonForSelling} 
          onValueChange={(value) => updateData({ reasonForSelling: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select reason" />
          </SelectTrigger>
          <SelectContent>
            {SELLING_REASONS.map((reason) => (
              <SelectItem key={reason} value={reason}>{reason}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
