
import React from 'react';
import { WIZARD_STEPS } from '../config/wizardSteps';
import { useTempDealCreation } from '../hooks/useTempDealCreation';

interface WizardNavigationProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  formData: any;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  onStepChange,
  formData
}) => {
  const { tempDealId, createTempDealIfNeeded } = useTempDealCreation();

  const nextStep = async () => {
    if (currentStep < WIZARD_STEPS.length) {
      // Create temp deal before moving to document upload step
      if (currentStep === 3) {
        await createTempDealIfNeeded(formData.dealTitle, formData.dealDescription);
      }
      
      onStepChange(currentStep + 1);
      console.log('Moving to step:', currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
      console.log('Moving back to step:', currentStep - 1);
    }
  };

  return {
    nextStep,
    prevStep,
    tempDealId
  };
};
