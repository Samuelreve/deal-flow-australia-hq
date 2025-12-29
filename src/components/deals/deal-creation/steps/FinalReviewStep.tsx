
import React, { useState } from 'react';
import { StepProps } from '../types';
import { ReviewSubmissionHeader } from './review-submission/ReviewSubmissionHeader';
import { BusinessInformationSummary } from './review-submission/BusinessInformationSummary';
import { DealInformationSummary } from './review-submission/DealInformationSummary';
import { SellerInformationSummary } from './review-submission/SellerInformationSummary';
import { DocumentsSummary } from './review-submission/DocumentsSummary';
import { FinalChecklist } from './review-submission/FinalChecklist';
import { ReviewSubmissionActions } from './review-submission/ReviewSubmissionActions';

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
    readyToCreate: false,
    autoGenerateContract: true // Default to enabled
  });

  const allChecked = checklist.reviewedDetails && checklist.uploadedDocs && checklist.readyToCreate;

  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSwitchChange = (key: keyof typeof checklist, value: boolean) => {
    setChecklist(prev => ({ ...prev, [key]: value }));
  };

  const downloadPDF = () => {
    // TODO: Implement PDF generation
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(checklist.autoGenerateContract);
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
        onSwitchChange={handleSwitchChange}
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
