
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, HandHeart, User, FileText, ClipboardCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import BusinessInfoStep from './steps/BusinessInfoStep';
import DealInfoStep from './steps/DealInfoStep';
import SellerDetailsStep from './steps/SellerDetailsStep';
import DocumentUploadStep from './steps/DocumentUploadStep';
import ReviewSubmissionStep from './steps/ReviewSubmissionStep';

import { WizardProgress } from './components/WizardProgress';
import { WizardStepCard } from './components/WizardStepCard';
import { AITip } from './components/AITip';
import { useTempDealCreation } from './hooks/useTempDealCreation';
import { useDealSubmission } from './hooks/useDealSubmission';

import { DealCreationData } from './types';

const STEPS = [
  { 
    id: 1, 
    title: 'Business Information', 
    icon: Building2,
    component: BusinessInfoStep,
    description: 'Tell us about your business'
  },
  { 
    id: 2, 
    title: 'Deal Information', 
    icon: HandHeart,
    component: DealInfoStep,
    description: 'Define your deal terms'
  },
  { 
    id: 3, 
    title: 'Seller & Legal Details', 
    icon: User,
    component: SellerDetailsStep,
    description: 'Your contact information'
  },
  { 
    id: 4, 
    title: 'Upload Documents', 
    icon: FileText,
    component: DocumentUploadStep,
    description: 'Secure document upload'
  },
  { 
    id: 5, 
    title: 'Review & Submit', 
    icon: ClipboardCheck,
    component: ReviewSubmissionStep,
    description: 'Final check and create'
  }
];

const DealCreationWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const { tempDealId, createTempDealIfNeeded } = useTempDealCreation();
  const { isSubmitting, handleSubmit } = useDealSubmission();
  
  const [formData, setFormData] = useState<DealCreationData>({
    // Business Information
    businessTradingName: '',
    businessLegalName: '',
    legalEntityType: '',
    abn: '',
    acn: '',
    registeredAddress: '',
    principalAddress: '',
    businessState: '',
    businessIndustry: '',
    yearsInOperation: 0,
    
    // Deal Information
    dealTitle: '',
    dealType: '',
    askingPrice: '',
    targetCompletionDate: '',
    dealDescription: '',
    keyAssetsIncluded: '',
    keyAssetsExcluded: '',
    reasonForSelling: '',
    
    // Seller Details - Initialize with user data
    primarySellerName: user?.profile?.name || user?.name || '',
    sellerEntityType: '',
    legalRepName: '',
    legalRepEmail: '',
    legalRepPhone: '',
    
    // Documents
    uploadedDocuments: []
  });

  const updateFormData = (stepData: Partial<DealCreationData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    console.log('Form data updated:', { ...formData, ...stepData });
  };

  const nextStep = async () => {
    if (currentStep < STEPS.length) {
      // Create temp deal before moving to document upload step
      if (currentStep === 3) {
        await createTempDealIfNeeded(formData.dealTitle, formData.dealDescription);
      }
      
      setCurrentStep(prev => prev + 1);
      console.log('Moving to step:', currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      console.log('Moving back to step:', currentStep - 1);
    }
  };

  const getCurrentStepComponent = () => {
    const step = STEPS.find(s => s.id === currentStep);
    if (!step) {
      console.error('Step not found:', currentStep);
      return null;
    }

    const StepComponent = step.component;
    
    // Pass the temp deal ID to DocumentUploadStep for real uploads
    const additionalProps = currentStep === 4 && tempDealId ? { dealId: tempDealId } : {};
    
    return (
      <StepComponent
        data={formData}
        updateData={updateFormData}
        onNext={nextStep}
        onPrev={prevStep}
        isLastStep={currentStep === STEPS.length}
        onSubmit={() => handleSubmit(formData)}
        isSubmitting={isSubmitting}
        {...additionalProps}
      />
    );
  };

  const currentStepInfo = STEPS.find(s => s.id === currentStep);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-muted-foreground mb-6">
          You must be logged in to create a deal. Please log in to continue.
        </p>
        <button 
          onClick={() => navigate('/auth')}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <WizardProgress steps={STEPS} currentStep={currentStep} />
      
      {currentStepInfo && (
        <WizardStepCard step={currentStepInfo}>
          {getCurrentStepComponent()}
        </WizardStepCard>
      )}

      <AITip step={currentStep} />
    </div>
  );
};

export default DealCreationWizard;
