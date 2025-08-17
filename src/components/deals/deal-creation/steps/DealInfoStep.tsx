
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ArrowLeft, HandHeart, Lightbulb, Sparkles, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { StepProps, DEAL_TYPES, SELLING_REASONS, DEAL_CATEGORIES } from '../types';
import { IPTransferFields } from './category-specific/IPTransferFields';
import { RealEstateFields } from './category-specific/RealEstateFields';
import { MicroDealFields } from './category-specific/MicroDealFields';
import { CrossBorderFields } from './category-specific/CrossBorderFields';

const DealInfoStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev }) => {
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
    
    if (!data.dealCategory) {
      newErrors.dealCategory = 'Deal category is required';
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

  const generateDescription = () => {
    // AI-powered description generation placeholder
    if (data.businessTradingName && data.businessIndustry) {
      const suggestion = `Established ${data.businessIndustry.toLowerCase()} business offering excellent growth opportunities. ${data.businessTradingName} has built a strong reputation and customer base over ${data.yearsInOperation || 'several'} years of operation.

Key Features:
• Proven business model with consistent revenue
• Strong market position in ${data.businessIndustry.toLowerCase()}
• Experienced team and established operations
• Excellent opportunity for growth and expansion

This ${data.dealType.toLowerCase()} represents a rare opportunity to acquire a well-established business with significant potential for the right buyer.`;
      
      updateData({ dealDescription: suggestion });
    }
  };

  const getValuationTip = () => {
    if (!data.askingPrice && data.businessIndustry && data.yearsInOperation > 0) {
      return `Based on ${data.businessIndustry} businesses with ${data.yearsInOperation} years of operation, typical asking prices range from 2-5x annual revenue. Consider getting a professional valuation.`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          This information helps potential buyers understand your business opportunity. 
          Be clear and comprehensive - it's your chance to make a great first impression.
        </AlertDescription>
      </Alert>

      {/* Deal Category Selection */}
      <div className="space-y-2">
        <Label htmlFor="dealCategory">
          Deal Category *
        </Label>
        <Select 
          value={data.dealCategory} 
          onValueChange={(value) => updateData({ dealCategory: value })}
        >
          <SelectTrigger className={errors.dealCategory ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select deal category" />
          </SelectTrigger>
          <SelectContent>
            {DEAL_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                <div className="flex flex-col items-start">
                  <span>{category.label}</span>
                  <span className="text-xs text-muted-foreground">{category.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.dealCategory && (
          <p className="text-sm text-red-500">{errors.dealCategory}</p>
        )}
      </div>

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
              placeholder="e.g., Sale of Smith's Coffee Shop - Asset Sale"
              className={`flex-1 ${errors.dealTitle ? 'border-red-500' : ''}`}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={generateDealTitle}
              disabled={!data.businessTradingName || !data.dealType}
              className="shrink-0"
            >
              <Sparkles className="mr-2 h-4 w-4" />
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
          <p className="text-xs text-muted-foreground">
            Asset Sale = business assets only; Share Sale = company ownership
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="askingPrice">
            Asking Price (AUD)
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="askingPrice"
              value={data.askingPrice}
              onChange={(e) => updateData({ askingPrice: formatPrice(e.target.value) })}
              placeholder="400,000 or leave blank for 'Price on Application'"
              className="pl-10"
            />
          </div>
          {getValuationTip() && (
            <Alert className="mt-2">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>AI Valuation Tip:</strong> {getValuationTip()}
              </AlertDescription>
            </Alert>
          )}
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
          <p className="text-xs text-muted-foreground">
            When you'd like the sale to be completed
          </p>
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
        <div className="flex items-center justify-between">
          <Label htmlFor="dealDescription">
            Deal Description *
          </Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={generateDescription}
            disabled={!data.businessTradingName || !data.businessIndustry}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Suggest
          </Button>
        </div>
        <Textarea
          id="dealDescription"
          value={data.dealDescription}
          onChange={(e) => updateData({ dealDescription: e.target.value })}
          placeholder="Describe your business opportunity. What makes it attractive to buyers? Include key strengths, growth opportunities, and why this is a good investment..."
          rows={6}
          className={errors.dealDescription ? 'border-red-500' : ''}
        />
        {errors.dealDescription && (
          <p className="text-sm text-red-500">{errors.dealDescription}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Tip: Include what your business does, key strengths, growth opportunities, and financial highlights
        </p>
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
              <Label htmlFor="keyAssetsIncluded">
                Key Assets Included
              </Label>
              <Textarea
                id="keyAssetsIncluded"
                value={data.keyAssetsIncluded}
                onChange={(e) => updateData({ keyAssetsIncluded: e.target.value })}
                placeholder="e.g., Equipment, Inventory, Customer List, Lease, Brand Name, Website, Intellectual Property"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyAssetsExcluded">
                Assets Excluded
              </Label>
              <Textarea
                id="keyAssetsExcluded"
                value={data.keyAssetsExcluded}
                onChange={(e) => updateData({ keyAssetsExcluded: e.target.value })}
                placeholder="e.g., Personal vehicles, Specific equipment, Cash reserves, Personal goodwill"
                rows={4}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Category-specific fields */}
      {data.dealCategory === 'ip_transfer' && (
        <IPTransferFields data={data} updateData={updateData} />
      )}
      
      {data.dealCategory === 'real_estate' && (
        <RealEstateFields data={data} updateData={updateData} />
      )}
      
      {data.dealCategory === 'micro_deals' && (
        <MicroDealFields data={data} updateData={updateData} />
      )}
      
      {data.dealCategory === 'cross_border' && (
        <CrossBorderFields data={data} updateData={updateData} />
      )}

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} size="lg" className="min-w-[160px]">
          Continue to Seller Details
        </Button>
      </div>
    </div>
  );
};

export default DealInfoStep;
