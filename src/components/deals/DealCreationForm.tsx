
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { DealFormData } from './deal-form/types';
import BusinessDetailsSection from './deal-form/BusinessDetailsSection';
import DealInformationSection from './deal-form/DealInformationSection';
import SellerInformationSection from './deal-form/SellerInformationSection';
import FormActions from './deal-form/FormActions';
import { useDealFormSubmit } from './deal-form/useDealFormSubmit';
import { Card, CardContent } from '@/components/ui/card';

const DealCreationForm: React.FC = () => {
  const { user } = useAuth();
  const { submitting, submitDeal } = useDealFormSubmit();
  
  // Initialize form with useForm hook
  const form = useForm<DealFormData>({
    defaultValues: {
      businessName: '',
      businessLegalName: '',
      businessTradingNames: '',
      businessLegalEntity: '',
      businessIdentifier: '',
      businessABN: '',
      businessACN: '',
      businessRegisteredAddress: '',
      businessPrincipalAddress: '',
      businessState: '',
      industry: '',
      yearsInOperation: '',
      title: '',
      description: '',
      askingPrice: '',
      dealType: '',
      keyAssetsIncluded: '',
      keyAssetsExcluded: '',
      reasonForSelling: '',
      targetCompletionDate: '',
      sellerName: user?.profile?.name || '',
      sellerEntityType: '',
      sellerRepresentative: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: DealFormData) => {
    await submitDeal(data);
  };

  return (
    <div className="w-full">
      <Card className="mb-8 bg-gradient-to-b from-white to-muted/30 border-none shadow-sm">
        <CardContent className="pt-6">
          <h2 className="text-xl font-medium mb-2">Create New Deal</h2>
          <p className="text-muted-foreground">
            Fill out the information below to start a new business deal. All fields marked with * are required.
          </p>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Business Details Section */}
          <BusinessDetailsSection form={form} />
          
          {/* Deal Information Section */}
          <DealInformationSection form={form} />
          
          {/* Seller Information Section */}
          <SellerInformationSection form={form} />
          
          {/* Next Steps and Submit */}
          <FormActions submitting={submitting} />
        </form>
      </Form>
    </div>
  );
};

export default DealCreationForm;
