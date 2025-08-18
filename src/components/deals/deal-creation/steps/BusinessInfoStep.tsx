
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StepProps } from '../types';
import { BusinessInformationForm } from './business-info/BusinessInformationForm';
import { AdvancedBusinessDetails } from './business-info/AdvancedBusinessDetails';
import { validateBusinessInfoStep } from './business-info/BusinessValidation';

const BusinessInfoStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const validationErrors = validateBusinessInfoStep(data);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      onNext();
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

      <BusinessInformationForm 
        data={data}
        errors={errors}
        onUpdateData={updateData}
      />

      <AdvancedBusinessDetails
        data={data}
        showAdvanced={showAdvanced}
        onToggleAdvanced={setShowAdvanced}
        onUpdateData={updateData}
      />

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} size="lg" className="min-w-[160px]">
          Continue to Deal Information
        </Button>
      </div>
    </div>
  );
};

export default BusinessInfoStep;
