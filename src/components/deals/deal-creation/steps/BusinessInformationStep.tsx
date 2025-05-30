
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { StepProps, LEGAL_ENTITY_TYPES } from '../types';

const BusinessInformationStep: React.FC<StepProps> = ({ data, updateData, onNext }) => {
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
    
    if (data.abn && !/^\d{11}$/.test(data.abn.replace(/\s/g, ''))) {
      newErrors.abn = 'ABN must be 11 digits';
    }
    
    if (data.acn && !/^\d{9}$/.test(data.acn.replace(/\s/g, ''))) {
      newErrors.acn = 'ACN must be 9 digits';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Building2 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Tell us about your business</h2>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          We'll use this information to create your deal listing and legal documents.
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
            placeholder="e.g., Smith's Bakery"
            className={errors.businessTradingName ? 'border-red-500' : ''}
          />
          {errors.businessTradingName && (
            <p className="text-sm text-red-500">{errors.businessTradingName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessLegalName">
            Legal Entity Name *
          </Label>
          <Input
            id="businessLegalName"
            value={data.businessLegalName}
            onChange={(e) => updateData({ businessLegalName: e.target.value })}
            placeholder="e.g., Smith's Bakery Pty Ltd"
            className={errors.businessLegalName ? 'border-red-500' : ''}
          />
          {errors.businessLegalName && (
            <p className="text-sm text-red-500">{errors.businessLegalName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="legalEntityType">
            Entity Type *
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
          <Label htmlFor="abn">
            ABN
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
              ACN
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="registeredAddress">
          Registered Address
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
              Principal Place of Business (if different)
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
        <Button onClick={handleNext} size="lg">
          Continue to Deal Information
        </Button>
      </div>
    </div>
  );
};

export default BusinessInformationStep;
