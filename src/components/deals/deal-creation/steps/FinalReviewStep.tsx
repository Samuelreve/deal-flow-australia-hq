
import React, { useState, useCallback } from 'react';
import { StepProps } from '../types';
import { ReviewSubmissionHeader } from './review-submission/ReviewSubmissionHeader';
import { BusinessInformationSummary } from './review-submission/BusinessInformationSummary';
import { DealInformationSummary } from './review-submission/DealInformationSummary';
import { SellerInformationSummary } from './review-submission/SellerInformationSummary';
import { DocumentsSummary } from './review-submission/DocumentsSummary';
import { FinalChecklist } from './review-submission/FinalChecklist';
import { ReviewSubmissionActions } from './review-submission/ReviewSubmissionActions';
import { generateDealSummaryPDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface FinalReviewStepProps extends StepProps {
  tempDealId?: string;
}

const FinalReviewStep: React.FC<FinalReviewStepProps> = ({ 
  data, 
  onPrev, 
  onSubmit, 
  isSubmitting,
  tempDealId
}) => {
  const [checklist, setChecklist] = useState({
    reviewedDetails: false,
    uploadedDocs: false,
    readyToCreate: false
  });

  const allChecked = Object.values(checklist).every(Boolean);

  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const { toast } = useToast();

  const downloadPDF = useCallback(() => {
    try {
      generateDealSummaryPDF(data);
      toast({
        title: 'PDF Generated',
        description: 'Deal summary has been generated and downloaded'
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'There was an error generating the PDF summary',
        variant: 'destructive'
      });
    }
  }, [data, toast]);

  const handleSubmit = () => {
    if (onSubmit) {
      console.log('Submitting final deal with temp ID:', tempDealId);
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <ReviewSubmissionHeader />

      <BusinessInformationSummary data={data} />

      <DealInformationSummary data={data} />

      <SellerInformationSummary data={data} />

      <DocumentsSummary data={data} onDownloadPDF={downloadPDF} />

      <FinalChecklist 
        checklist={checklist}
        onChecklistChange={handleChecklistChange}
      />

      <ReviewSubmissionActions
        onPrev={onPrev}
        onSubmit={handleSubmit}
        allChecked={allChecked}
        isSubmitting={isSubmitting}
      />

      {tempDealId && (
        <div className="text-sm text-muted-foreground text-center">
          Deal ID: {tempDealId} (will be finalized upon submission)
        </div>
      )}
    </div>
  );
};

export default FinalReviewStep;
