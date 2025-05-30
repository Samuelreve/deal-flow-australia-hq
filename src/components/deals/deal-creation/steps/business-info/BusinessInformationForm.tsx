
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LEGAL_ENTITY_TYPES, BUSINESS_STATES, BUSINESS_INDUSTRIES, DealCreationData } from '../../types';
import { formatABN, formatACN } from './BusinessFormats';

interface BusinessInformationFormProps {
  data: DealCreationData;
  errors: Record<string, string>;
  onUpdateData: (updates: Partial<DealCreationData>) => void;
}

export const BusinessInformationForm: React.FC<BusinessInformationFormProps> = ({
  data,
  errors,
  onUpdateData
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="businessTradingName">
            Business Trading Name *
          </Label>
          <Input
            id="businessTradingName"
            value={data.businessTradingName}
            onChange={(e) => onUpdateData({ businessTradingName: e.target.value })}
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
            onChange={(e) => onUpdateData({ businessLegalName: e.target.value })}
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
            onValueChange={(value) => onUpdateData({ legalEntityType: value })}
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
            onValueChange={(value) => onUpdateData({ businessIndustry: value })}
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
            onChange={(e) => onUpdateData({ abn: formatABN(e.target.value) })}
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
              onChange={(e) => onUpdateData({ acn: formatACN(e.target.value) })}
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
            onValueChange={(value) => onUpdateData({ businessState: value })}
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
            onChange={(e) => onUpdateData({ yearsInOperation: parseInt(e.target.value) || 0 })}
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
          onChange={(e) => onUpdateData({ registeredAddress: e.target.value })}
          placeholder="123 Business Street, City, State, Postcode"
          rows={2}
        />
      </div>
    </>
  );
};
