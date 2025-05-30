
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ArrowLeft, User, Info, UserCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

import { StepProps, SELLER_ENTITY_TYPES } from '../types';

const SellerDetailsStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev }) => {
  const { user } = useAuth();
  const [showLegalRep, setShowLegalRep] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Auto-fill seller name from user profile
    if (user?.name && !data.primarySellerName) {
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

  return (
    <div className="space-y-6">
      <Alert>
        <UserCheck className="h-4 w-4" />
        <AlertDescription>
          This information identifies you as the seller and will be used in legal documents. 
          Your details are secure and will only be shared with authorized parties.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="primarySellerName">
            Primary Seller Contact Name *
          </Label>
          <Input
            id="primarySellerName"
            value={data.primarySellerName}
            onChange={(e) => updateData({ primarySellerName: e.target.value })}
            placeholder="John Smith"
            className={errors.primarySellerName ? 'border-red-500' : ''}
          />
          {errors.primarySellerName && (
            <p className="text-sm text-red-500">{errors.primarySellerName}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Auto-filled from your profile - you can edit if needed
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
          <p className="text-xs text-muted-foreground">
            This may differ from the business entity type
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
        <CollapsibleContent className="space-y-4 mt-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Adding a lawyer or advisor now streamlines the process. They can be invited to collaborate 
              on your deal once it's created, giving them secure access to documents and communications.
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
                placeholder="Sarah Johnson"
              />
              <p className="text-xs text-muted-foreground">
                Lawyer, advisor, or legal representative
              </p>
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

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Why add a legal representative?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• They can review documents and provide legal guidance</li>
              <li>• Streamlines communication during negotiations</li>
              <li>• Helps ensure legal compliance throughout the process</li>
              <li>• Can be invited to collaborate securely on your deal</li>
            </ul>
          </div>
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
