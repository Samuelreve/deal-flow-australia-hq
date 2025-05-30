
import React, { useState } from 'react';
import { StepProps } from '../types';
import { ReviewSubmissionHeader } from './review-submission/ReviewSubmissionHeader';
import { BusinessInformationSummary } from './review-submission/BusinessInformationSummary';
import { DealInformationSummary } from './review-submission/DealInformationSummary';
import { SellerInformationSummary } from './review-submission/SellerInformationSummary';
import { DocumentsSummary } from './review-submission/DocumentsSummary';
import { FinalChecklist } from './review-submission/FinalChecklist';
import { ReviewSubmissionActions } from './review-submission/ReviewSubmissionActions';

const ReviewSubmissionStep: React.FC<StepProps> = ({ 
  data, 
  onPrev, 
  onSubmit, 
  isSubmitting 
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

  const downloadPDF = () => {
    // TODO: Implement PDF generation
    console.log('Downloading PDF summary...');
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
        onSubmit={onSubmit!}
        allChecked={allChecked}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ReviewSubmissionStep;
