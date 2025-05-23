
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeals } from "@/hooks/useDeals";
import HealthThresholdSettings from "@/components/deals/health/HealthThresholdSettings";

interface HealthThresholdManagerProps {
  userId?: string;
}

const HealthThresholdManager: React.FC<HealthThresholdManagerProps> = ({ userId }) => {
  const { deals, loading } = useDeals(userId);
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  
  useEffect(() => {
    if (deals.length > 0 && !selectedDealId) {
      setSelectedDealId(deals[0].id);
    }
  }, [deals, selectedDealId]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Threshold Settings</CardTitle>
          <CardDescription>Loading deals...</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (deals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Threshold Settings</CardTitle>
          <CardDescription>No deals available to configure thresholds</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deal Health Threshold Management</CardTitle>
          <CardDescription>
            Configure health alert thresholds for each of your deals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Select value={selectedDealId} onValueChange={setSelectedDealId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a deal" />
              </SelectTrigger>
              <SelectContent>
                {deals.map(deal => (
                  <SelectItem key={deal.id} value={deal.id}>
                    {deal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedDealId && (
            <HealthThresholdSettings dealId={selectedDealId} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthThresholdManager;
