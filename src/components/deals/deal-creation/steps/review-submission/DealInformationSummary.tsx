
import React from 'react';
import { HandHeart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DealCreationData } from '../../types';

interface DealInformationSummaryProps {
  data: DealCreationData;
}

export const DealInformationSummary: React.FC<DealInformationSummaryProps> = ({ data }) => {
  const formatPrice = (price: string) => {
    if (!price) return 'Price on Application';
    return `$${price}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <HandHeart className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Deal Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Deal Title</p>
          <p className="font-medium text-lg">{data.dealTitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Deal Type</p>
            <p className="font-medium">{data.dealType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Asking Price</p>
            <p className="font-medium">{formatPrice(data.askingPrice)}</p>
          </div>
          {data.targetCompletionDate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Target Completion</p>
              <p className="font-medium">{new Date(data.targetCompletionDate).toLocaleDateString()}</p>
            </div>
          )}
          {data.reasonForSelling && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reason for Selling</p>
              <p className="font-medium">{data.reasonForSelling}</p>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Description</p>
          <p className="text-sm bg-muted p-3 rounded mt-1">{data.dealDescription}</p>
        </div>
      </CardContent>
    </Card>
  );
};
