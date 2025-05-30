
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SELLER_ENTITY_TYPES } from '../types';

interface PrimarySellerFormProps {
  primarySellerName: string;
  sellerEntityType: string;
  errors: Record<string, string>;
  onUpdatePrimarySellerName: (name: string) => void;
  onUpdateSellerEntityType: (type: string) => void;
  isAutoFilled: boolean;
}

export const PrimarySellerForm: React.FC<PrimarySellerFormProps> = ({
  primarySellerName,
  sellerEntityType,
  errors,
  onUpdatePrimarySellerName,
  onUpdateSellerEntityType,
  isAutoFilled
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <Label htmlFor="primarySellerName">
        Primary Seller Contact Name *
      </Label>
      <Input
        id="primarySellerName"
        value={primarySellerName}
        onChange={(e) => onUpdatePrimarySellerName(e.target.value)}
        placeholder="John Smith"
        className={errors.primarySellerName ? 'border-red-500' : ''}
      />
      {errors.primarySellerName && (
        <p className="text-sm text-red-500">{errors.primarySellerName}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {isAutoFilled ? 
          'Auto-filled from your profile - you can edit if needed' : 
          'This will be your primary contact name for this deal'
        }
      </p>
    </div>

    <div className="space-y-2">
      <Label htmlFor="sellerEntityType">
        Seller Entity Type *
      </Label>
      <Select 
        value={sellerEntityType} 
        onValueChange={onUpdateSellerEntityType}
      >
        <SelectTrigger className={errors.sellerEntityType ? 'border-red-500' : ''}>
          <SelectValue placeholder="Select entity type" />
        </SelectTrigger>
        <SelectContent>
          {SELLER_ENTITY_TYPES.map((type) => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.sellerEntityType && (
        <p className="text-sm text-red-500">{errors.sellerEntityType}</p>
      )}
      <p className="text-xs text-muted-foreground">
        This may differ from the business entity type
      </p>
    </div>
  </div>
);
