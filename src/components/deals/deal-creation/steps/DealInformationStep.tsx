
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ArrowLeft, HandHeart, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { StepProps, DEAL_TYPES, SELLING_REASONS } from '../types';

const DealInformationStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.dealTitle) {
      newErrors.dealTitle = 'Deal title is required';
    }
    
    if (!data.dealDescription) {
      newErrors.dealDescription = 'Deal description is required';
    }
    
    if (!data.dealType) {
      newErrors.dealType = 'Deal type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const formatPrice = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const generateDealTitle = () => {
    if (data.businessTradingName && data.dealType) {
      const title = `Sale of ${data.businessTradingName} - ${data.dealType}`;
      updateData({ dealTitle: title });
    }
  };

  const getDescriptionPlaceholder = () => {
    return `Describe your business and what makes it attractive to buyers. Include:
• What your business does
• How long you've been operating
• Key strengths and assets
• Growth opportunities
• Why this is a good investment`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <HandHeart className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Tell us about this deal</h2>
      </div>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          This information will help potential buyers understand your business and make informed decisions.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className={`flex-1 ${errors.dealTitle ? 'border-red-500' : ''}`}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={generateDealTitle}
              disabled={!data.businessTradingName || !data.dealType}
            >
              Auto-generate
            </Button>
          </div>
          {errors.dealTitle && (
            <p className="text-sm text-red-500">{errors.dealTitle}</p>
          )}
        </div>

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

      <div className="space-y-2">
        <Label htmlFor="dealDescription">
          Deal Description *
        </Label>
        <Textarea
          id="dealDescription"
          value={data.dealDescription}
          onChange={(e) => updateData({ dealDescription: e.target.value })}
          placeholder={getDescriptionPlaceholder()}
          rows={6}
          className={errors.dealDescription ? 'border-red-500' : ''}
        />
        {errors.dealDescription && (
          <p className="text-sm text-red-500">{errors.dealDescription}</p>
        )}
      </div>

      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            Add asset details (optional)
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="assetsIncluded">
                Key Assets Included
              </Label>
              <Textarea
                id="assetsIncluded"
                value={data.assetsIncluded}
                onChange={(e) => updateData({ assetsIncluded: e.target.value })}
                placeholder="e.g., Equipment, Inventory, Customer List, Lease, Brand Name"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetsExcluded">
                Assets Excluded
              </Label>
              <Textarea
                id="assetsExcluded"
                value={data.assetsExcluded}
                onChange={(e) => updateData({ assetsExcluded: e.target.value })}
                placeholder="e.g., Personal vehicles, Specific equipment, Cash reserves"
                rows={4}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} size="lg">
          Continue to Seller Details
        </Button>
      </div>
    </div>
  );
};

export default DealInformationStep;
