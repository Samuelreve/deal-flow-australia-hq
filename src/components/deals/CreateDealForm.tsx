
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useDeals } from '@/hooks/useDeals';
import { Loader2 } from 'lucide-react';

interface CreateDealFormData {
  title: string;
  description: string;
  business_name: string;
  business_industry: string;
  asking_price: number;
}

interface CreateDealFormProps {
  onSuccess?: () => void;
}

const CreateDealForm: React.FC<CreateDealFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createDeal } = useDeals();
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateDealFormData>();

  const onSubmit = async (data: CreateDealFormData) => {
    setIsSubmitting(true);
    try {
      await createDeal({
        title: data.title,
        description: data.description,
        business_name: data.business_name,
        business_industry: data.business_industry,
        asking_price: data.asking_price,
        status: 'draft'
      });
      
      toast({
        title: "Deal created successfully",
        description: "Your new deal has been created.",
      });
      
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create deal:', error);
      toast({
        variant: "destructive",
        title: "Failed to create deal",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Deal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Deal Title *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter deal title"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the deal..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              {...register('business_name')}
              placeholder="Enter business name"
            />
          </div>

          <div>
            <Label htmlFor="business_industry">Industry</Label>
            <Input
              id="business_industry"
              {...register('business_industry')}
              placeholder="e.g., Technology, Retail, Manufacturing"
            />
          </div>

          <div>
            <Label htmlFor="asking_price">Asking Price</Label>
            <Input
              id="asking_price"
              type="number"
              {...register('asking_price', { valueAsNumber: true })}
              placeholder="Enter asking price"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Deal...
              </>
            ) : (
              'Create Deal'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateDealForm;
