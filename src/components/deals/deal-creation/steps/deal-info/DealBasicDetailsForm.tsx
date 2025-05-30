
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DealCreationData, DEAL_TYPES, SELLING_REASONS } from '../../types';

interface DealBasicDetailsFormProps {
  data: DealCreationData;
  updateData: (updates: Partial<DealCreationData>) => void;
  errors: Record<string, string>;
}

export const DealBasicDetailsForm: React.FC<DealBasicDetailsFormProps> = ({
  data,
  updateData,
  errors
}) => {
  const formatPrice = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="dealType">
          Deal Type *
        </Label>
        <Select 
          value={data.dealType} 
          onValueChange={(value) => updateData({ dealType: value })}
        >
          <SelectTrigger className={errors.dealType ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select deal type" />
          </SelectTrigger>
          <SelectContent>
            {DEAL_TYPES.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.dealType && (
          <p className="text-sm text-red-500">{errors.dealType}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="askingPrice">
          Asking Price (Optional)
        </Label>
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
