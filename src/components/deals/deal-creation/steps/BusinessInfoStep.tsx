
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StepProps } from '../types';
import { BusinessInformationForm } from './business-info/BusinessInformationForm';
import { AdvancedBusinessDetails } from './business-info/AdvancedBusinessDetails';
import { BusinessDocumentUpload } from './business-info/BusinessDocumentUpload';
import { validateBusinessInfoStep } from './business-info/BusinessValidation';

const BusinessInfoStep: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const validationErrors = validateBusinessInfoStep(data);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          This information will be used to create your deal listing and generate legal documents. 
          All fields marked with * are required. Upload business documents to help AI generate more accurate deal descriptions.
        </AlertDescription>
      </Alert>

      <BusinessInformationForm 
        data={data}
        errors={errors}
        onUpdateData={updateData}
      />

      <AdvancedBusinessDetails
        data={data}
        showAdvanced={showAdvanced}
        onToggleAdvanced={setShowAdvanced}
        onUpdateData={updateData}
      />

      <BusinessDocumentUpload
        data={data}
        showDocuments={showDocuments}
        onToggleDocuments={setShowDocuments}
        onUpdateData={updateData}
        tempDealId={data.tempDealId || `temp-${Date.now()}`}
      />

      <div className="flex justify-end pt-6">
        <Button onClick={handleNext} size="lg" className="min-w-[160px]">
          Continue to Deal Information
        </Button>
      </div>
    </div>
  );
};

export default BusinessInfoStep;
