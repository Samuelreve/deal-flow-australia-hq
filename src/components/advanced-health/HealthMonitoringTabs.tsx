
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Deal } from "@/types/deal";
import HealthPredictionPanel from "@/components/deals/health/HealthPredictionPanel";
import CustomMetricsManager from "@/components/deals/health/CustomMetricsManager";
import HealthRecoveryPlanGenerator from "@/components/deals/health/HealthRecoveryPlanGenerator";
import HealthComparisonTool from "@/components/deals/health/HealthComparisonTool";
import HealthReportGenerator from "@/components/deals/health/HealthReportGenerator";
import RealTimeHealthMonitor from "@/components/deals/health/RealTimeHealthMonitor";
import { UseAdvancedHealthMonitoringReturn } from "@/hooks/useAdvancedHealthMonitoring/types";

interface HealthMonitoringTabsProps {
  deals: Deal[];
  selectedDeal: Deal | null;
  selectedDealId: string;
  healthData: UseAdvancedHealthMonitoringReturn;
  onHealthScoreUpdate: (dealId: string, newScore: number) => void;
}

const HealthMonitoringTabs: React.FC<HealthMonitoringTabsProps> = ({
  deals,
  selectedDeal,
  selectedDealId,
  healthData,
  onHealthScoreUpdate
}) => {
  const {
    predictions,
    customMetrics,
    recoveryPlans,
    comparisons,
    reports,
    createCustomMetric,
    createRecoveryPlan,
    createComparison,
    generateReport
  } = healthData;

  return (
    <Tabs defaultValue="predictions" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="predictions">Predictions</TabsTrigger>
        <TabsTrigger value="metrics">Custom Metrics</TabsTrigger>
        <TabsTrigger value="recovery">Recovery Plans</TabsTrigger>
        <TabsTrigger value="comparison">Comparison</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="realtime">Real-Time</TabsTrigger>
      </TabsList>

      <TabsContent value="predictions" className="space-y-6">
        <HealthPredictionPanel 
          predictions={predictions} 
          dealId={selectedDealId || undefined}
        />
      </TabsContent>

      <TabsContent value="metrics" className="space-y-6">
        {selectedDeal ? (
          <CustomMetricsManager 
            dealId={selectedDeal.id}
            metrics={customMetrics}
            onCreateMetric={createCustomMetric}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Please select a specific deal to manage custom metrics
          </div>
        )}
      </TabsContent>

      <TabsContent value="recovery" className="space-y-6">
        {selectedDeal ? (
          <HealthRecoveryPlanGenerator 
            dealId={selectedDeal.id}
            currentScore={selectedDeal.healthScore}
            recoveryPlans={recoveryPlans}
            onCreatePlan={createRecoveryPlan}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Please select a specific deal to create recovery plans
          </div>
        )}
      </TabsContent>

      <TabsContent value="comparison" className="space-y-6">
        <HealthComparisonTool 
          deals={deals}
          comparisons={comparisons}
          onCreateComparison={createComparison}
        />
      </TabsContent>

      <TabsContent value="reports" className="space-y-6">
        <HealthReportGenerator 
          deals={deals}
          reports={reports}
          onGenerateReport={generateReport}
        />
      </TabsContent>

      <TabsContent value="realtime" className="space-y-6">
        <RealTimeHealthMonitor 
          deals={deals}
          onHealthScoreUpdate={onHealthScoreUpdate}
        />
      </TabsContent>
    </Tabs>
  );
};

export default HealthMonitoringTabs;
