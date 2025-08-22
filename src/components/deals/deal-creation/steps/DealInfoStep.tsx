
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ArrowLeft, HandHeart, Lightbulb, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { StepProps, DEAL_TYPES, SELLING_REASONS, DEAL_CATEGORIES } from '../types';
import { IPTransferFields } from './category-specific/IPTransferFields';
import { BusinessSaleFields } from './category-specific/BusinessSaleFields';
import { RealEstateFields } from './category-specific/RealEstateFields';
import { MicroDealFields } from './category-specific/MicroDealFields';
import { CrossBorderFields } from './category-specific/CrossBorderFields';
import { useDocumentExtraction } from '@/contexts/DocumentExtractionContext';
import { AIDocumentSuggestion } from '../components/AIDocumentSuggestion';

const DealInfoStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { extractedData } = useDocumentExtraction();

  // Helper function to check if a field should be shown for the current category
  const shouldShowField = (field: string): boolean => {
    if (!data.dealCategory) return true; // Show all fields if no category selected
    
    const categoryFields = {
      business_sale: ['dealTitle', 'dealType', 'askingPrice', 'targetCompletionDate', 'reasonForSelling', 'dealDescription', 'assetDetails'],
      real_estate: ['dealTitle', 'askingPrice', 'targetCompletionDate', 'dealDescription'],
      ip_transfer: ['dealTitle', 'dealDescription'],
      micro_deals: ['dealTitle', 'askingPrice', 'dealDescription'],
      cross_border: ['dealTitle', 'dealType', 'askingPrice', 'targetCompletionDate', 'dealDescription'],
      franchise: ['dealTitle', 'dealType', 'askingPrice', 'targetCompletionDate', 'reasonForSelling', 'dealDescription', 'assetDetails'],
    };
    
    const allowedFields = categoryFields[data.dealCategory as keyof typeof categoryFields] || [];
    return allowedFields.includes(field);
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    // Only validate fields that are shown for the current category
    if (shouldShowField('dealTitle') && !data.dealTitle) {
      newErrors.dealTitle = 'Deal title is required';
    }
    
    if (shouldShowField('dealDescription') && !data.dealDescription) {
      newErrors.dealDescription = 'Deal description is required';
    }
    
    if (shouldShowField('dealType') && !data.dealType) {
      newErrors.dealType = 'Deal type is required';
    }
    
    if (!data.dealCategory) {
      newErrors.dealCategory = 'Deal category should be selected in the previous step';
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

      {/* Category Display */}
      <Alert>
        <HandHeart className="h-4 w-4" />
        <AlertDescription>
          Deal Category: <strong>{DEAL_CATEGORIES.find(c => c.value === data.dealCategory)?.label || 'Not selected'}</strong>
          {data.dealCategory && (
            <span className="text-muted-foreground"> - {DEAL_CATEGORIES.find(c => c.value === data.dealCategory)?.description}</span>
          )}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deal Title - Always shown */}
        {shouldShowField('dealTitle') && (
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
              <AIDocumentSuggestion
                documentText={extractedData?.text}
                extractedData={extractedData?.extractedData}
                fieldType="title"
                currentValue={data.dealTitle}
                onSuggestion={(suggestion) => updateData({ dealTitle: suggestion })}
                dealCategory={data.dealCategory}
              />
            </div>
            {errors.dealTitle && (
              <p className="text-sm text-red-500">{errors.dealTitle}</p>
            )}
          </div>
        )}

        {/* Deal Type - Business Sale, Cross Border, Franchise */}
        {shouldShowField('dealType') && (
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
        )}

        {/* Asking Price - All except IP Transfer */}
        {shouldShowField('askingPrice') && (
          <div className="space-y-2">
            <Label htmlFor="askingPrice">
              Asking Price
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
        )}

        {/* Currency - Show for all deal types */}
        {shouldShowField('askingPrice') && (
          <div className="space-y-2">
            <Label htmlFor="currency">
              Currency (ISO 4217)
            </Label>
            <Select 
              value={data.currency || 'AUD'} 
              onValueChange={(value) => updateData({ currency: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                <SelectItem value="NZD">NZD - New Zealand Dollar</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Currency for the asking price (defaults to AUD)
            </p>
          </div>
        )}

        {/* Target Completion Date - Business Sale, Real Estate, Cross Border, Franchise */}
        {shouldShowField('targetCompletionDate') && (
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
        )}

        {/* Reason for Selling - Business Sale, Franchise */}
        {shouldShowField('reasonForSelling') && (
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
        )}
      </div>

      {/* Deal Description - Always shown */}
      {shouldShowField('dealDescription') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="dealDescription">
              Deal Description *
            </Label>
            <AIDocumentSuggestion
              documentText={extractedData?.text}
              extractedData={extractedData?.extractedData}
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
      )}

      {/* Asset Details - Business Sale, Franchise */}
      {shouldShowField('assetDetails') && (
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
      )}

      {/* Category-specific fields */}
      {data.dealCategory === 'business_sale' && (
        <BusinessSaleFields data={data} updateData={updateData} />
      )}
      
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
