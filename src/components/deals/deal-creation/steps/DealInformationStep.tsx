
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { StepProps } from '../types';
import { DealInfoHeader } from './deal-info/DealInfoHeader';
import { DealTitleSection } from './deal-info/DealTitleSection';
import { DealBasicDetailsForm } from './deal-info/DealBasicDetailsForm';
import { DealDescriptionSection } from './deal-info/DealDescriptionSection';
import { DealAssetsSection } from './deal-info/DealAssetsSection';
import { validateDealInfoStep } from './deal-info/DealInfoValidation';
import { useToast } from '@/hooks/use-toast';

const DealInformationStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev, documentContext }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const { toast } = useToast();

  // Auto-fill form fields with extracted document data
  useEffect(() => {
    if (documentContext?.extractedData && !hasAutoFilled) {
      console.log('Auto-filling form with extracted data:', documentContext.extractedData);
      
      const extractedData = documentContext.extractedData;
      const autoFillData: any = {};
      
      // Count how many fields we're auto-filling
      let fieldsAutoFilled = 0;

      // Auto-fill deal title if extracted and not already set
      if (extractedData.dealTitle && !data.dealTitle) {
        autoFillData.dealTitle = extractedData.dealTitle;
        fieldsAutoFilled++;
      }

      // Auto-fill deal description if extracted and not already set
      if (extractedData.dealDescription && !data.dealDescription) {
        autoFillData.dealDescription = extractedData.dealDescription;
        fieldsAutoFilled++;
      }

      // Auto-fill deal type if extracted and not already set
      if (extractedData.dealType && !data.dealType) {
        autoFillData.dealType = extractedData.dealType;
        fieldsAutoFilled++;
      }

      // Auto-fill asking price if extracted and not already set
      if (extractedData.askingPrice && !data.askingPrice) {
        autoFillData.askingPrice = extractedData.askingPrice;
        fieldsAutoFilled++;
      }

      // Auto-fill reason for selling if extracted and not already set
      if (extractedData.reasonForSelling && !data.reasonForSelling) {
        autoFillData.reasonForSelling = extractedData.reasonForSelling;
        fieldsAutoFilled++;
      }

      // Auto-fill business details
      if (extractedData.businessTradingName && !data.businessTradingName) {
        autoFillData.businessTradingName = extractedData.businessTradingName;
        fieldsAutoFilled++;
      }

      if (extractedData.businessLegalName && !data.businessLegalName) {
        autoFillData.businessLegalName = extractedData.businessLegalName;
        fieldsAutoFilled++;
      }

      if (extractedData.businessIndustry && !data.businessIndustry) {
        autoFillData.businessIndustry = extractedData.businessIndustry;
        fieldsAutoFilled++;
      }

      if (extractedData.keyAssetsIncluded && !data.keyAssetsIncluded) {
        autoFillData.keyAssetsIncluded = extractedData.keyAssetsIncluded;
        fieldsAutoFilled++;
      }

      if (extractedData.keyAssetsExcluded && !data.keyAssetsExcluded) {
        autoFillData.keyAssetsExcluded = extractedData.keyAssetsExcluded;
        fieldsAutoFilled++;
      }

      // Update form data with auto-filled fields
      if (fieldsAutoFilled > 0) {
        updateData(autoFillData);
        setHasAutoFilled(true);
        
        toast({
          title: "Form Auto-Filled", 
          description: `${fieldsAutoFilled} field(s) automatically filled from your uploaded document.`,
        });
        
        console.log(`Auto-filled ${fieldsAutoFilled} fields:`, autoFillData);
      }
    }
  }, [documentContext, data, updateData, hasAutoFilled, toast]);

  const validateStep = () => {
    const newErrors = validateDealInfoStep(data);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <DealInfoHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DealTitleSection 
          data={data}
          updateData={updateData}
          error={errors.dealTitle}
          documentText={documentContext?.extractedText}
          extractedData={documentContext?.extractedData}
        />
      </div>

      <DealBasicDetailsForm 
        data={data}
        updateData={updateData}
        errors={errors}
        documentText={documentContext?.extractedText}
        extractedData={documentContext?.extractedData}
      />

      <DealDescriptionSection 
        data={data}
        updateData={updateData}
        error={errors.dealDescription}
        documentText={documentContext?.extractedText}
        extractedData={documentContext?.extractedData}
      />

      <DealAssetsSection 
        data={data}
        updateData={updateData}
        showAdvanced={showAdvanced}
        onToggleAdvanced={setShowAdvanced}
      />

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} size="lg">
          Continue to Seller Details
        </Button>
      </div>
    </div>
  );
};

export default DealInformationStep;
