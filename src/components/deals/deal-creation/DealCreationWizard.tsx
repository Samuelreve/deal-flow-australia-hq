
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Building2, HandHeart, User, FileText, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { dealsService } from '@/services/dealsService';
import { tempDealService } from '@/services/tempDealService';

import BusinessInfoStep from './steps/BusinessInfoStep';
import DealInfoStep from './steps/DealInfoStep';
import SellerDetailsStep from './steps/SellerDetailsStep';
import DocumentUploadStep from './steps/DocumentUploadStep';
import ReviewSubmissionStep from './steps/ReviewSubmissionStep';

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
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempDealId, setTempDealId] = useState<string | null>(null);
  
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

  // Create temporary deal when moving to document upload step
  const createTempDealIfNeeded = async () => {
    if (currentStep === 3 && !tempDealId && formData.dealTitle) {
      try {
        console.log('Creating temporary deal for document uploads...');
        const { dealId } = await tempDealService.createTempDeal({
          title: formData.dealTitle,
          description: formData.dealDescription,
          type: 'business_sale'
        });
        setTempDealId(dealId);
        console.log('Temporary deal created:', dealId);
      } catch (error) {
        console.error('Failed to create temporary deal:', error);
        toast({
          title: "Warning",
          description: "Could not prepare document upload. Documents will be uploaded after deal creation.",
          variant: "destructive"
        });
      }
    }
  };

  const nextStep = async () => {
    if (currentStep < STEPS.length) {
      // Create temp deal before moving to document upload step
      if (currentStep === 3) {
        await createTempDealIfNeeded();
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

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a deal.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Starting deal submission with data:', formData);
    
    try {
      // Create the deal using the real dealsService
      const dealData = {
        title: formData.dealTitle,
        description: formData.dealDescription,
        asking_price: formData.askingPrice ? parseFloat(formData.askingPrice) : undefined,
        business_industry: formData.businessIndustry,
        target_completion_date: formData.targetCompletionDate,
        status: 'draft' as const,
        health_score: 50, // Starting health score
        // Map additional business details
        business_legal_name: formData.businessLegalName,
        business_trading_names: formData.businessTradingName,
        business_legal_entity_type: formData.legalEntityType,
        business_abn: formData.abn,
        business_acn: formData.acn,
        business_registered_address: formData.registeredAddress,
        business_principal_place_address: formData.principalAddress,
        business_state: formData.businessState,
        business_years_in_operation: formData.yearsInOperation,
        deal_type: formData.dealType,
        key_assets_included: formData.keyAssetsIncluded,
        key_assets_excluded: formData.keyAssetsExcluded,
        reason_for_selling: formData.reasonForSelling,
        primary_seller_contact_name: formData.primarySellerName
      };

      const newDeal = await dealsService.createDeal(dealData);
      
      console.log('Deal created successfully:', newDeal);
      toast({
        title: "Deal Created Successfully!",
        description: "Your business sale is now live and ready for collaboration.",
      });
      
      // Navigate to the new deal's page
      navigate(`/deals/${newDeal.id}`);
    } catch (error: any) {
      console.error('Error creating deal:', error);
      toast({
        title: "Error Creating Deal",
        description: error.message || "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        {...additionalProps}
      />
    );
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;
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
      {/* Progress Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </div>
          <div className="text-sm font-medium text-primary">
            {Math.round(progressPercentage)}% Complete
          </div>
        </div>
        
        <Progress value={progressPercentage} className="h-3 mb-6" />
        
        {/* Step indicators */}
        <div className="flex justify-between">
          {STEPS.map((step) => {
            const StepIcon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            
            return (
              <div 
                key={step.id}
                className={`flex flex-col items-center text-center flex-1 ${
                  isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`mb-2 p-3 rounded-full border-2 ${
                  isCompleted 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : isCurrent 
                    ? 'border-primary bg-background' 
                    : 'border-muted bg-background'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className={`text-sm font-medium ${
                    isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            {currentStepInfo && (
              <>
                <currentStepInfo.icon className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">{currentStepInfo.title}</CardTitle>
                  <p className="text-muted-foreground mt-1">{currentStepInfo.description}</p>
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {getCurrentStepComponent()}
        </CardContent>
      </Card>

      {/* AI Assistant Tip */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <span className="text-blue-600 font-bold text-sm">AI</span>
          </div>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Smart Tip:</strong> {getAITipForStep(currentStep)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Tips for each step
const getAITipForStep = (step: number): string => {
  const tips = {
    1: "Complete business details help generate accurate legal documents and milestone planning. Don't worry about getting everything perfect - you can always edit later.",
    2: "A clear deal description attracts serious buyers. Consider highlighting what makes your business unique and profitable.",
    3: "Adding a legal representative now streamlines the process later. They can be invited to collaborate on your deal once it's created.",
    4: "Upload core documents now to speed up due diligence. Financial statements and asset lists are particularly valuable for buyers.",
    5: "Review everything carefully - this creates your official deal listing. You can always make changes from the deal dashboard after submission."
  };
  
  return tips[step as keyof typeof tips] || "Complete this step to continue with your deal creation.";
};

export default DealCreationWizard;
