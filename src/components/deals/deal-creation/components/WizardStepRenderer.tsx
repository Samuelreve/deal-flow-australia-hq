
import React from 'react';
import { WIZARD_STEPS } from '../config/wizardSteps';
import { DealCreationData } from '../types';
import { useDocumentExtraction } from '@/contexts/DocumentExtractionContext';

interface WizardStepRendererProps {
  currentStep: number;
  formData: DealCreationData;
  updateFormData: (data: Partial<DealCreationData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  tempDealId?: string;
}

export const WizardStepRenderer: React.FC<WizardStepRendererProps> = ({
  currentStep,
  formData,
  updateFormData,
  onNext,
  onPrev,
  onSubmit,
  isSubmitting,
  tempDealId
}) => {
  const { extractedData } = useDocumentExtraction();
  const step = WIZARD_STEPS.find(s => s.id === currentStep);
  
  if (!step) {
    console.error('Step not found:', currentStep);
    return null;
  }

  const StepComponent = step.component;
  
  // Pass the temp deal ID to DocumentUploadStep for real uploads
  let additionalProps: any = {};
  
  if (currentStep === 3 && tempDealId) {
    additionalProps.dealId = tempDealId;
  }
  
  // Pass document context to DealInformationStep (step 2)
  if (currentStep === 2 && extractedData) {
    additionalProps.documentContext = {
      extractedText: extractedData.text,
      extractedData: extractedData.extractedData
    };
  }
  
  return (
    <StepComponent
      data={formData}
      updateData={updateFormData}
      onNext={onNext}
      onPrev={onPrev}
      isLastStep={currentStep === WIZARD_STEPS.length}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      {...additionalProps}
    />
  );
};
