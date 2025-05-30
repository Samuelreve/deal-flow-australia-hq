import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

import BusinessInformationStep from './steps/BusinessInformationStep';
import DealInformationStep from './steps/DealInformationStep';
import SellerDetailsStep from './steps/SellerDetailsStep';
import DocumentUploadStep from './steps/DocumentUploadStep';
import ReviewSubmissionStep from './steps/ReviewSubmissionStep';

import { DealCreationData } from './types';

const STEPS = [
  { id: 1, title: 'Business Information', component: BusinessInformationStep },
  { id: 2, title: 'Deal Information', component: DealInformationStep },
  { id: 3, title: 'Seller Details', component: SellerDetailsStep },
  { id: 4, title: 'Documents', component: DocumentUploadStep },
  { id: 5, title: 'Review & Submit', component: ReviewSubmissionStep }
];

const CreateDealWizard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    
    // Seller Details
    primarySellerName: '',
    sellerEntityType: '',
    legalRepName: '',
    legalRepEmail: '',
    legalRepPhone: '',
    
    // Documents
    uploadedDocuments: []
  });

  const updateFormData = (stepData: Partial<DealCreationData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Submit to API
      console.log('Submitting deal:', formData);
      
      toast({
        title: "Deal Created Successfully",
        description: "Your deal has been created and is now draft status.",
      });
      
      // Navigate to deals dashboard
      navigate('/deals');
    } catch (error) {
      console.error('Error creating deal:', error);
      toast({
        title: "Error Creating Deal",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentStepComponent = () => {
    const step = STEPS.find(s => s.id === currentStep);
    if (!step) return null;

    const StepComponent = step.component;
    return (
      <StepComponent
        data={formData}
        updateData={updateFormData}
        onNext={nextStep}
        onPrev={prevStep}
        isLastStep={currentStep === STEPS.length}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/deals')}
            className="text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Deals
          </Button>
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Create New Deal</h1>
        <p className="text-muted-foreground">
          Let's set up your business sale. We'll guide you through each step.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progressPercentage} className="h-2 mb-4" />
        <div className="flex justify-between text-sm">
          {STEPS.map((step) => (
            <div 
              key={step.id}
              className={`flex items-center ${
                step.id <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              {step.id < currentStep ? (
                <CheckCircle className="mr-1 h-4 w-4" />
              ) : (
                <div className={`mr-1 h-4 w-4 rounded-full border-2 ${
                  step.id === currentStep 
                    ? 'border-primary bg-primary' 
                    : 'border-muted-foreground'
                }`} />
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {STEPS.find(s => s.id === currentStep)?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getCurrentStepComponent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateDealWizard;
