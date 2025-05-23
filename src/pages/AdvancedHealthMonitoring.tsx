
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useDeals } from "@/hooks/useDeals";
import { useAuth } from "@/contexts/AuthContext";
import { useAdvancedHealthMonitoring } from "@/hooks/useAdvancedHealthMonitoring";
import AdvancedHealthHeader from "@/components/advanced-health/AdvancedHealthHeader";
import DealSelector from "@/components/advanced-health/DealSelector";
import HealthMonitoringTabs from "@/components/advanced-health/HealthMonitoringTabs";

const AdvancedHealthMonitoring = () => {
  const { user } = useAuth();
  const { dealSummaries, loading: dealsLoading } = useDeals(user?.id);
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  
  const healthData = useAdvancedHealthMonitoring(user?.id);

  const handleHealthScoreUpdate = (dealId: string, newScore: number) => {
    console.log(`Deal ${dealId} health score updated to ${newScore}%`);
  };

  if (dealsLoading || healthData.loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading advanced health monitoring...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const selectedDeal = selectedDealId ? dealSummaries.find(d => d.id === selectedDealId) : null;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <AdvancedHealthHeader />
        <DealSelector 
          deals={dealSummaries}
          selectedDealId={selectedDealId}
          onSelectionChange={setSelectedDealId}
        />
        <HealthMonitoringTabs
          deals={dealSummaries}
          selectedDeal={selectedDeal}
          selectedDealId={selectedDealId}
          healthData={healthData}
          onHealthScoreUpdate={handleHealthScoreUpdate}
        />
      </div>
    </AppLayout>
  );
};

export default AdvancedHealthMonitoring;
