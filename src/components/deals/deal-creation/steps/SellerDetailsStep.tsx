
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
