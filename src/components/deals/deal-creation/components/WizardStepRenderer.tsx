
import React from 'react';
import { WIZARD_STEPS } from '../config/wizardSteps';
import { DealCreationData } from '../types';

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
  const step = WIZARD_STEPS.find(s => s.id === currentStep);
  
  if (!step) {
    console.error('Step not found:', currentStep);
    return null;
  }

  const StepComponent = step.component;
  
  // Pass the temp deal ID to DocumentUploadStep for real uploads
  const additionalProps = currentStep === 5 && tempDealId ? { dealId: tempDealId } : {};
  
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
