
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeals } from "@/hooks/useDeals";
import { useAuth } from "@/contexts/AuthContext";
import { useAdvancedHealthMonitoring } from "@/hooks/useAdvancedHealthMonitoring";
import HealthPredictionPanel from "@/components/deals/health/HealthPredictionPanel";
import CustomMetricsManager from "@/components/deals/health/CustomMetricsManager";
import HealthRecoveryPlanGenerator from "@/components/deals/health/HealthRecoveryPlanGenerator";
import HealthComparisonTool from "@/components/deals/health/HealthComparisonTool";
import HealthReportGenerator from "@/components/deals/health/HealthReportGenerator";
import RealTimeHealthMonitor from "@/components/deals/health/RealTimeHealthMonitor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const AdvancedHealthMonitoring = () => {
  const { user } = useAuth();
  const { deals, loading: dealsLoading } = useDeals(user?.id);
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  
  const {
    predictions,
    customMetrics,
    recoveryPlans,
    comparisons,
    reports,
    loading,
    createCustomMetric,
    createRecoveryPlan,
    createComparison,
    generateReport
  } = useAdvancedHealthMonitoring(user?.id);

  const handleHealthScoreUpdate = (dealId: string, newScore: number) => {
    console.log(`Deal ${dealId} health score updated to ${newScore}%`);
    // This would trigger a refresh of deal data in a real implementation
  };

  if (dealsLoading || loading) {
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

  const selectedDeal = selectedDealId ? deals.find(d => d.id === selectedDealId) : null;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Advanced Health Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive health analytics, predictions, and recovery planning
          </p>
        </div>

        <div className="mb-6">
          <Label>Focus on Specific Deal (Optional)</Label>
          <Select value={selectedDealId} onValueChange={setSelectedDealId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="All deals or select specific deal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Deals</SelectItem>
              {deals.filter(d => d.status === 'active').map(deal => (
                <SelectItem key={deal.id} value={deal.id}>
                  {deal.title} ({deal.healthScore}%)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              onHealthScoreUpdate={handleHealthScoreUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdvancedHealthMonitoring;
