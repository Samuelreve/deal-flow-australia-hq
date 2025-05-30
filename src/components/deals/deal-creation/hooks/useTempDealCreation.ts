
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { tempDealService } from '@/services/tempDealService';

export const useTempDealCreation = () => {
  const [tempDealId, setTempDealId] = useState<string | null>(null);
  const { toast } = useToast();

  const createTempDealIfNeeded = async (dealTitle: string, dealDescription?: string) => {
    if (tempDealId || !dealTitle) return tempDealId;

    try {
      console.log('Creating temporary deal for document uploads...');
      const { dealId } = await tempDealService.createTempDeal({
        title: dealTitle,
        description: dealDescription,
        type: 'business_sale'
      });
      setTempDealId(dealId);
      console.log('Temporary deal created:', dealId);
      return dealId;
    } catch (error) {
      console.error('Failed to create temporary deal:', error);
      toast({
        title: "Warning",
        description: "Could not prepare document upload. Documents will be uploaded after deal creation.",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    tempDealId,
    createTempDealIfNeeded
  };
};
