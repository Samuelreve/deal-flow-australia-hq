
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { StepProps } from '../types';
import { DealInfoHeader } from './deal-info/DealInfoHeader';
import { DealTitleSection } from './deal-info/DealTitleSection';
import { DealBasicDetailsForm } from './deal-info/DealBasicDetailsForm';
import { DealDescriptionSection } from './deal-info/DealDescriptionSection';
import { DealAssetsSection } from './deal-info/DealAssetsSection';
import { validateDealInfoStep } from './deal-info/DealInfoValidation';

const DealInformationStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev, documentContext }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors = validateDealInfoStep(data);
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
      <DealInfoHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DealTitleSection 
          data={data}
          updateData={updateData}
          error={errors.dealTitle}
          documentText={documentContext?.extractedText}
          extractedData={documentContext?.extractedData}
        />
      </div>

      <DealBasicDetailsForm 
        data={data}
        updateData={updateData}
        errors={errors}
        documentText={documentContext?.extractedText}
        extractedData={documentContext?.extractedData}
      />

      <DealDescriptionSection 
        data={data}
        updateData={updateData}
        error={errors.dealDescription}
        documentText={documentContext?.extractedText}
        extractedData={documentContext?.extractedData}
      />

      <DealAssetsSection 
        data={data}
        updateData={updateData}
        showAdvanced={showAdvanced}
        onToggleAdvanced={setShowAdvanced}
      />

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} size="lg">
          Continue to Seller Details
        </Button>
      </div>
    </div>
  );
};

export default DealInformationStep;
