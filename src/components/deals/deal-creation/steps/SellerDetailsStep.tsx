
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ArrowLeft, User, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

import { StepProps, SELLER_ENTITY_TYPES } from '../types';

const SellerDetailsStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev }) => {
  const { user } = useAuth();
  const [showLegalRep, setShowLegalRep] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Auto-fill seller name from user profile
    if (user?.name && !data.sellerName) {
      updateData({ 
        sellerName: user.name,
        sellerEntityType: 'Individual'
      });
    }
  }, [user, data.sellerName, updateData]);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.sellerName) {
      newErrors.sellerName = 'Seller name is required';
    }
    
    if (!data.sellerEntityType) {
      newErrors.sellerEntityType = 'Seller entity type is required';
    }

    if (showLegalRep && data.legalRepName) {
      if (data.legalRepEmail && !/\S+@\S+\.\S+/.test(data.legalRepEmail)) {
        newErrors.legalRepEmail = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <User className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Seller Information</h2>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This information identifies you as the seller and will be used in legal documents.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sellerName">
            Primary Seller Name *
          </Label>
          <Input
            id="sellerName"
            value={data.sellerName}
            onChange={(e) => updateData({ sellerName: e.target.value })}
            placeholder="John Smith"
            className={errors.sellerName ? 'border-red-500' : ''}
          />
          {errors.sellerName && (
            <p className="text-sm text-red-500">{errors.sellerName}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Auto-filled from your profile
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellerEntityType">
            Seller Entity Type *
          </Label>
          <Select 
            value={data.sellerEntityType} 
            onValueChange={(value) => updateData({ sellerEntityType: value })}
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
        </div>
      </div>

      <Collapsible open={showLegalRep} onOpenChange={setShowLegalRep}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            Add legal representative (optional)
            <ChevronDown className={`h-4 w-4 transition-transform ${showLegalRep ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Add a lawyer or trusted advisor who can represent you in this deal.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="legalRepName">
                Representative Name
              </Label>
              <Input
                id="legalRepName"
                value={data.legalRepName}
                onChange={(e) => updateData({ legalRepName: e.target.value })}
                placeholder="Sarah Johnson, Smith & Co Legal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalRepEmail">
                Email
              </Label>
              <Input
                id="legalRepEmail"
                type="email"
                value={data.legalRepEmail}
                onChange={(e) => updateData({ legalRepEmail: e.target.value })}
                placeholder="sarah@smithlegal.com"
                className={errors.legalRepEmail ? 'border-red-500' : ''}
              />
              {errors.legalRepEmail && (
                <p className="text-sm text-red-500">{errors.legalRepEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalRepPhone">
                Phone
              </Label>
              <Input
                id="legalRepPhone"
                type="tel"
                value={data.legalRepPhone}
                onChange={(e) => updateData({ legalRepPhone: e.target.value })}
                placeholder="(02) 9876 5432"
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
          Continue to Documents
        </Button>
      </div>
    </div>
  );
};

export default SellerDetailsStep;
