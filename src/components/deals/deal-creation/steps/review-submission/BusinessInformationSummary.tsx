
import React from 'react';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DealCreationData } from '../../types';

interface BusinessInformationSummaryProps {
  data: DealCreationData;
}

export const BusinessInformationSummary: React.FC<BusinessInformationSummaryProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Business Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Trading Name</p>
            <p className="font-medium">{data.businessTradingName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Legal Entity</p>
            <p className="font-medium">{data.businessLegalName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
            <p className="font-medium">{data.legalEntityType}</p>
          </div>
          {data.abn && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">ABN</p>
              <p className="font-medium">{data.abn}</p>
            </div>
          )}
        </div>
        {data.registeredAddress && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Registered Address</p>
            <p className="text-sm">{data.registeredAddress}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
