
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ArrowLeft, UserCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

import { PrimarySellerForm } from '../seller-details/PrimarySellerForm';
import { LegalRepresentativeForm } from '../seller-details/LegalRepresentativeForm';

import { StepProps } from '../types';

const SellerDetailsStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev }) => {
  const { user } = useAuth();
  const [showLegalRep, setShowLegalRep] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Auto-fill seller name from real user profile
    if (user?.profile?.name && !data.primarySellerName) {
      updateData({ 
        primarySellerName: user.profile.name,
        sellerEntityType: 'Individual'
      });
    } else if (user?.name && !data.primarySellerName) {
      updateData({ 
        primarySellerName: user.name,
        sellerEntityType: 'Individual'
      });
    }
  }, [user, data.primarySellerName, updateData]);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.primarySellerName) {
      newErrors.primarySellerName = 'Primary seller name is required';
    }
    
    if (!data.sellerEntityType) {
      newErrors.sellerEntityType = 'Seller entity type is required';
    }

    // Jurisdiction is required for IP Transfer and Real Estate
    if ((data.dealCategory === 'ip_transfer' || data.dealCategory === 'real_estate') && !data.jurisdiction) {
      newErrors.jurisdiction = 'Jurisdiction is required for this deal type';
    }

    // Counterparty country is required for Cross Border
    if (data.dealCategory === 'cross_border' && !data.counterpartyCountry) {
      newErrors.counterpartyCountry = 'Counterparty country is required for cross-border deals';
    }

    // Validate buyer email format if provided
    if (data.buyerEmail && !/\S+@\S+\.\S+/.test(data.buyerEmail)) {
      newErrors.buyerEmail = 'Please enter a valid email address';
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

  const isAutoFilled = !!(user?.profile?.name || user?.name);

  return (
    <div className="space-y-6">
      <Alert>
        <UserCheck className="h-4 w-4" />
        <AlertDescription>
          This information identifies you as the seller and will be used in legal documents. 
          Your details are secure and will only be shared with authorized parties.
        </AlertDescription>
      </Alert>

      <PrimarySellerForm
        primarySellerName={data.primarySellerName}
        sellerEntityType={data.sellerEntityType}
        errors={errors}
        onUpdatePrimarySellerName={(name) => updateData({ primarySellerName: name })}
        onUpdateSellerEntityType={(type) => updateData({ sellerEntityType: type })}
        isAutoFilled={isAutoFilled}
      />

      {/* Jurisdiction - Required for IP Transfer and Real Estate */}
      {(data.dealCategory === 'ip_transfer' || data.dealCategory === 'real_estate') && (
        <div className="space-y-2">
          <Label htmlFor="jurisdiction">
            Jurisdiction *
          </Label>
          <Input
            id="jurisdiction"
            value={data.jurisdiction}
            onChange={(e) => updateData({ jurisdiction: e.target.value })}
            placeholder="e.g., New South Wales, Australia"
            className={errors.jurisdiction ? 'border-red-500' : ''}
          />
          {errors.jurisdiction && (
            <p className="text-sm text-red-500">{errors.jurisdiction}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Legal jurisdiction for this {data.dealCategory === 'ip_transfer' ? 'IP transfer' : 'property transaction'}
          </p>
        </div>
      )}

      {/* Counterparty Country - Required for Cross Border */}
      {data.dealCategory === 'cross_border' && (
        <div className="space-y-2">
          <Label htmlFor="counterpartyCountry">
            Counterparty Country *
          </Label>
          <Input
            id="counterpartyCountry"
            value={data.counterpartyCountry}
            onChange={(e) => updateData({ counterpartyCountry: e.target.value })}
            placeholder="e.g., United States"
            className={errors.counterpartyCountry ? 'border-red-500' : ''}
          />
          {errors.counterpartyCountry && (
            <p className="text-sm text-red-500">{errors.counterpartyCountry}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Country of the other party in this cross-border transaction
          </p>
        </div>
      )}

      {/* Optional Buyer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="buyerName">
            Buyer Name (Optional)
          </Label>
          <Input
            id="buyerName"
            value={data.buyerName || ''}
            onChange={(e) => updateData({ buyerName: e.target.value })}
            placeholder="Buyer's full name or company name"
          />
          <p className="text-xs text-muted-foreground">
            Can be added later if not known at creation
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyerEmail">
            Buyer Email (Optional)
          </Label>
          <Input
            id="buyerEmail"
            type="email"
            value={data.buyerEmail || ''}
            onChange={(e) => updateData({ buyerEmail: e.target.value })}
            placeholder="buyer@example.com"
            className={errors.buyerEmail ? 'border-red-500' : ''}
          />
          {errors.buyerEmail && (
            <p className="text-sm text-red-500">{errors.buyerEmail}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Contact email for the buyer (if known)
          </p>
        </div>
      </div>

      <Collapsible open={showLegalRep} onOpenChange={setShowLegalRep}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            Add legal representative (optional)
            <ChevronDown className={`h-4 w-4 transition-transform ${showLegalRep ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <LegalRepresentativeForm
            legalRepName={data.legalRepName}
            legalRepEmail={data.legalRepEmail}
            legalRepPhone={data.legalRepPhone}
            errors={errors}
            onUpdateLegalRepName={(name) => updateData({ legalRepName: name })}
            onUpdateLegalRepEmail={(email) => updateData({ legalRepEmail: email })}
            onUpdateLegalRepPhone={(phone) => updateData({ legalRepPhone: phone })}
          />
        </CollapsibleContent>
      </Collapsible>

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} size="lg" className="min-w-[160px]">
          Continue to Documents
        </Button>
      </div>
    </div>
  );
};

export default SellerDetailsStep;
