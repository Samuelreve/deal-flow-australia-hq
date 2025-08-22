
import React from 'react';
import { WIZARD_STEPS } from './config/wizardSteps';
import { WizardProgress } from './components/WizardProgress';
import { WizardStepCard } from './components/WizardStepCard';
import { WizardAuthGuard } from './components/WizardAuthGuard';
import { WizardStepRenderer } from './components/WizardStepRenderer';
import { AITip } from './components/AITip';
import { useWizardState } from './hooks/useWizardState';
import { useWizardNavigation } from './hooks/useWizardNavigation';
import { useDealSubmission } from './hooks/useDealSubmission';
import { DocumentExtractionProvider } from '@/contexts/DocumentExtractionContext';

const DealCreationWizard: React.FC = () => {
  const { currentStep, setCurrentStep, formData, updateFormData } = useWizardState();
  const { isSubmitting, handleSubmit } = useDealSubmission();
  const { nextStep, prevStep, tempDealId } = useWizardNavigation({
    currentStep,
    onStepChange: setCurrentStep,
    formData
  });

  const currentStepInfo = WIZARD_STEPS.find(s => s.id === currentStep);

  const handleFinalSubmit = () => {
    handleSubmit(formData, tempDealId);
  };

  return (
    <WizardAuthGuard>
      <DocumentExtractionProvider>
        <div className="max-w-5xl mx-auto">
          <WizardProgress steps={WIZARD_STEPS} currentStep={currentStep} />
          
          {currentStepInfo && (
            <WizardStepCard step={currentStepInfo}>
              <WizardStepRenderer
                currentStep={currentStep}
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
                onSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
                tempDealId={tempDealId}
              />
            </WizardStepCard>
          )}

          <AITip step={currentStep} />
        </div>
      </DocumentExtractionProvider>
    </WizardAuthGuard>
  );
};

export default DealCreationWizard;
