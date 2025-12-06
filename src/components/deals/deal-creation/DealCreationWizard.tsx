import React, { useState } from 'react';
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
import GeneratedDocumentReview from '../document/GeneratedDocumentReview';
import { DealArchitectChat, GeneratedMilestone } from '../deal-architect';
import { DealCreationData } from './types';

const DealCreationWizard: React.FC = () => {
  const { currentStep, setCurrentStep, formData, updateFormData } = useWizardState();
  const { 
    isSubmitting, 
    handleSubmit, 
    showDocumentPreview, 
    generatedDocument, 
    handleDocumentSave,
    isSavingDocument 
  } = useDealSubmission();
  const { nextStep, prevStep, tempDealId } = useWizardNavigation({
    currentStep,
    onStepChange: setCurrentStep,
    formData
  });

  const [isAIMode, setIsAIMode] = useState(false);
  const [aiMilestones, setAIMilestones] = useState<GeneratedMilestone[]>([]);

  const currentStepInfo = WIZARD_STEPS.find(s => s.id === currentStep);

  const handleFinalSubmit = (autoGenerateContract?: boolean) => {
    handleSubmit(formData, tempDealId, autoGenerateContract, aiMilestones);
  };

  const handleLaunchAIArchitect = () => {
    setIsAIMode(true);
  };

  const handleAIDealCreated = (dealData: Partial<DealCreationData>, milestones: GeneratedMilestone[]) => {
    // Merge AI-generated data with form data
    updateFormData(dealData);
    setAIMilestones(milestones);
    
    // Submit the deal
    handleSubmit({ ...formData, ...dealData }, tempDealId, false, milestones);
  };

  const handleCancelAI = () => {
    setIsAIMode(false);
    updateFormData({ dealCategory: '' });
  };

  // Render AI Chat mode
  if (isAIMode) {
    return (
      <WizardAuthGuard>
        <DocumentExtractionProvider>
          <div className="max-w-4xl mx-auto">
            <DealArchitectChat
              onDealCreated={handleAIDealCreated}
              onCancel={handleCancelAI}
            />
          </div>
        </DocumentExtractionProvider>
      </WizardAuthGuard>
    );
  }

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
                onLaunchAIArchitect={handleLaunchAIArchitect}
              />
            </WizardStepCard>
          )}

          <AITip step={currentStep} />
        </div>

        <GeneratedDocumentReview
          open={showDocumentPreview}
          onClose={() => {}}
          initialText={generatedDocument || ''}
          isSaving={isSavingDocument}
          onSave={handleDocumentSave}
        />
      </DocumentExtractionProvider>
    </WizardAuthGuard>
  );
};

export default DealCreationWizard;
