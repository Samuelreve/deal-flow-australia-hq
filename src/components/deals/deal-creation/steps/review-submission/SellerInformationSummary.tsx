
import React from 'react';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DealCreationData } from '../../types';

interface SellerInformationSummaryProps {
  data: DealCreationData;
}

export const SellerInformationSummary: React.FC<SellerInformationSummaryProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Seller Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Seller Name</p>
            <p className="font-medium">{data.primarySellerName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
            <p className="font-medium">{data.sellerEntityType}</p>
          </div>
        </div>
        {data.legalRepName && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Legal Representative</p>
            <p className="font-medium">{data.legalRepName}</p>
            {data.legalRepEmail && (
              <p className="text-sm text-muted-foreground">{data.legalRepEmail}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
