
import { useEffect } from 'react';
import { useTempDealCreation } from './useTempDealCreation';
import { WIZARD_STEPS } from '../config/wizardSteps';

interface UseWizardNavigationProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  formData: any;
}

export const useWizardNavigation = ({
  currentStep,
  onStepChange,
  formData
}: UseWizardNavigationProps) => {
  const { tempDealId, createTempDealIfNeeded } = useTempDealCreation();

  // Create temp deal when wizard starts for consistent use across all steps
  useEffect(() => {
    const initializeTempDeal = async () => {
      if (!tempDealId && currentStep === 1) {
        const dealId = await createTempDealIfNeeded(
          formData.businessLegalName || formData.dealTitle || 'Draft Deal',
          'Temporary deal for document upload'
        );
        console.log('Temp deal created for wizard:', dealId);
      }
    };
    initializeTempDeal();
  }, [currentStep, tempDealId, createTempDealIfNeeded, formData.businessLegalName, formData.dealTitle]);

  const nextStep = async () => {
    if (currentStep < WIZARD_STEPS.length) {
      // Create temp deal before moving to document upload step (step 4)
      if (currentStep === 3) {
        const dealId = await createTempDealIfNeeded(
          formData.dealTitle || 'Draft Deal', 
          formData.dealDescription || 'Deal in progress'
        );
        console.log('Temp deal created/retrieved for document upload:', dealId);
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
