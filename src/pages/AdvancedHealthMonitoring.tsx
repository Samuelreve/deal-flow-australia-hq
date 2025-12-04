
import React, { useState } from "react";
import { useDeals } from "@/hooks/useDeals";
import { useAuth } from "@/contexts/AuthContext";
import { useAdvancedHealthMonitoring } from "@/hooks/useAdvancedHealthMonitoring";
import AdvancedHealthHeader from "@/components/advanced-health/AdvancedHealthHeader";
import DealSelector from "@/components/advanced-health/DealSelector";
import HealthMonitoringTabs from "@/components/advanced-health/HealthMonitoringTabs";
import RealTimeHealthMonitor from "@/components/deals/health/RealTimeHealthMonitor";
import HealthPredictionEngine from "@/components/health/HealthPredictionEngine";
import RecoveryPlanGenerator from "@/components/health/RecoveryPlanGenerator";
import PerformanceDashboard from "@/components/health/PerformanceDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { convertDealsToDealSummaries } from "@/utils/dealConversion";

const AdvancedHealthMonitoring = () => {
  const { user } = useAuth();
  const { deals, loading: dealsLoading } = useDeals();
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  
  const healthData = useAdvancedHealthMonitoring(user?.id);

  const handleHealthScoreUpdate = (dealId: string, newScore: number) => {
    console.log(`Deal ${dealId} health score updated to ${newScore}%`);
  };

  if (dealsLoading || healthData.loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading advanced health monitoring...</p>
        </div>
      </div>
    );
  }

  // Convert deals to DealSummary format
  const dealSummaries = convertDealsToDealSummaries(deals);
  const selectedDeal = selectedDealId ? dealSummaries.find(d => d.id === selectedDealId) : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <AdvancedHealthHeader />
      
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="recovery">Recovery Plans</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <PerformanceDashboard deals={dealSummaries} />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <RealTimeHealthMonitor
            deals={dealSummaries}
            onHealthScoreUpdate={handleHealthScoreUpdate}
          />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <HealthPredictionEngine
            deals={dealSummaries}
            userId={user?.id}
          />
        </TabsContent>

        <TabsContent value="recovery" className="space-y-6">
          <RecoveryPlanGenerator
            deals={dealSummaries}
            userId={user?.id}
          />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6">
            <PerformanceDashboard deals={dealSummaries} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedHealthMonitoring;
