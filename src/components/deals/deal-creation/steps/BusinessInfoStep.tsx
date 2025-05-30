
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Building2, AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

import { StepProps, LEGAL_ENTITY_TYPES, BUSINESS_STATES, BUSINESS_INDUSTRIES } from '../types';

const BusinessInfoStep: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const { user } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.businessTradingName) {
      newErrors.businessTradingName = 'Business trading name is required';
    }
    
    if (!data.businessLegalName) {
      newErrors.businessLegalName = 'Business legal name is required';
    }
    
    if (!data.legalEntityType) {
      newErrors.legalEntityType = 'Legal entity type is required';
    }
    
    if (!data.businessIndustry) {
      newErrors.businessIndustry = 'Business industry is required';
    }
    
    if (data.abn && !/^\d{2}\s\d{3}\s\d{3}\s\d{3}$/.test(data.abn)) {
      newErrors.abn = 'ABN must be in format: 12 345 678 901';
    }
    
    if (data.acn && !/^\d{3}\s\d{3}\s\d{3}$/.test(data.acn)) {
      newErrors.acn = 'ACN must be in format: 123 456 789';
    }

    if (data.yearsInOperation < 0) {
      newErrors.yearsInOperation = 'Years in operation cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const formatABN = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
    }
    return digits;
  };

  const formatACN = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 3) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    }
    return digits;
  };

  const generateBusinessDescription = () => {
    // AI suggestion placeholder - would integrate with actual AI service
    if (data.businessTradingName && data.businessIndustry) {
      const suggestion = `Established ${data.businessIndustry.toLowerCase()} business with strong market presence. ${data.businessTradingName} has been serving customers for ${data.yearsInOperation || 'several'} years, offering quality products/services in the ${data.businessIndustry.toLowerCase()} sector.`;
      // This would trigger an AI call in a real implementation
      console.log('AI suggestion would be:', suggestion);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          This information will be used to create your deal listing and generate legal documents. 
          All fields marked with * are required.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="businessTradingName">
            Business Trading Name *
          </Label>
          <Input
            id="businessTradingName"
            value={data.businessTradingName}
            onChange={(e) => updateData({ businessTradingName: e.target.value })}
            placeholder="e.g., Smith's Coffee Shop"
            className={errors.businessTradingName ? 'border-red-500' : ''}
          />
          {errors.businessTradingName && (
            <p className="text-sm text-red-500">{errors.businessTradingName}</p>
          )}
          <p className="text-xs text-muted-foreground">
            The name your business trades under
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessLegalName">
            Business Legal Name *
          </Label>
          <Input
            id="businessLegalName"
            value={data.businessLegalName}
            onChange={(e) => updateData({ businessLegalName: e.target.value })}
            placeholder="e.g., Smith's Coffee Shop Pty Ltd"
            className={errors.businessLegalName ? 'border-red-500' : ''}
          />
          {errors.businessLegalName && (
            <p className="text-sm text-red-500">{errors.businessLegalName}</p>
          )}
          <p className="text-xs text-muted-foreground">
            The official registered legal name
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="legalEntityType">
            Legal Entity Type *
          </Label>
          <Select 
            value={data.legalEntityType} 
            onValueChange={(value) => updateData({ legalEntityType: value })}
          >
            <SelectTrigger className={errors.legalEntityType ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select entity type" />
            </SelectTrigger>
            <SelectContent>
              {LEGAL_ENTITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.legalEntityType && (
            <p className="text-sm text-red-500">{errors.legalEntityType}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessIndustry">
            Business Industry *
          </Label>
          <Select 
            value={data.businessIndustry} 
            onValueChange={(value) => updateData({ businessIndustry: value })}
          >
            <SelectTrigger className={errors.businessIndustry ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.businessIndustry && (
            <p className="text-sm text-red-500">{errors.businessIndustry}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="abn">
            ABN (Australian Business Number)
          </Label>
          <Input
            id="abn"
            value={data.abn}
            onChange={(e) => updateData({ abn: formatABN(e.target.value) })}
            placeholder="12 345 678 901"
            maxLength={14}
            className={errors.abn ? 'border-red-500' : ''}
          />
          {errors.abn && (
            <p className="text-sm text-red-500">{errors.abn}</p>
          )}
        </div>

        {data.legalEntityType === 'Pty Ltd' && (
          <div className="space-y-2">
            <Label htmlFor="acn">
              ACN (Australian Company Number)
            </Label>
            <Input
              id="acn"
              value={data.acn}
              onChange={(e) => updateData({ acn: formatACN(e.target.value) })}
              placeholder="123 456 789"
              maxLength={11}
              className={errors.acn ? 'border-red-500' : ''}
            />
            {errors.acn && (
              <p className="text-sm text-red-500">{errors.acn}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="businessState">
            Business State/Territory
          </Label>
          <Select 
            value={data.businessState} 
            onValueChange={(value) => updateData({ businessState: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_STATES.map((state) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsInOperation">
            Years in Operation
          </Label>
          <Input
            id="yearsInOperation"
            type="number"
            min="0"
            value={data.yearsInOperation || ''}
            onChange={(e) => updateData({ yearsInOperation: parseInt(e.target.value) || 0 })}
            placeholder="5"
            className={errors.yearsInOperation ? 'border-red-500' : ''}
          />
          {errors.yearsInOperation && (
            <p className="text-sm text-red-500">{errors.yearsInOperation}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="registeredAddress">
          Registered Business Address
        </Label>
        <Textarea
          id="registeredAddress"
          value={data.registeredAddress}
          onChange={(e) => updateData({ registeredAddress: e.target.value })}
          placeholder="123 Business Street, City, State, Postcode"
          rows={2}
        />
      </div>

      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            Add more details (optional)
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="principalAddress">
              Principal Place of Business (if different from registered address)
            </Label>
            <Textarea
              id="principalAddress"
              value={data.principalAddress}
              onChange={(e) => updateData({ principalAddress: e.target.value })}
              placeholder="789 Trading Street, City, State, Postcode"
              rows={2}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex justify-end pt-6">
        <Button onClick={handleNext} size="lg" className="min-w-[160px]">
          Continue to Deal Information
        </Button>
      </div>
    </div>
  );
};

export default BusinessInfoStep;
