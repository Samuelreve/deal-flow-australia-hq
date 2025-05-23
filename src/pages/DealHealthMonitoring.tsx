
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeals } from "@/hooks/useDeals";
import { useAuth } from "@/contexts/AuthContext";
import HealthScoreOverviewChart from "@/components/deals/health/HealthScoreOverviewChart";
import DealHealthHistoryChart from "@/components/deals/health/DealHealthHistoryChart";
import HealthAlertsList from "@/components/deals/health/HealthAlertsList";
import HealthThresholdManager from "@/components/deals/health/HealthThresholdManager";
import HealthNotificationSettings from "@/components/deals/health/HealthNotificationSettings";
import DealHealthTable from "@/components/deals/health/DealHealthTable";
import DealHealthFilters from "@/components/deals/health/DealHealthFilters";

const DealHealthMonitoring = () => {
  const { user } = useAuth();
  const { deals, loading } = useDeals(user?.id);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [healthFilterValue, setHealthFilterValue] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Find the deal with the lowest health score
  useEffect(() => {
    if (deals.length > 0 && !selectedDealId) {
      const lowestHealthDeal = [...deals]
        .filter(d => d.status === 'active')
        .sort((a, b) => a.healthScore - b.healthScore)[0];
        
      if (lowestHealthDeal) {
        setSelectedDealId(lowestHealthDeal.id);
      }
    }
  }, [deals, selectedDealId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading health data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Deal Health Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage the health of all your business deals in one place
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 md:w-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Health Score Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Health Score Overview</CardTitle>
                <CardDescription>
                  Average health score across all your active deals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HealthScoreOverviewChart deals={deals} />
              </CardContent>
            </Card>

            {/* Filters and Table */}
            <DealHealthFilters 
              healthFilterValue={healthFilterValue}
              setHealthFilterValue={setHealthFilterValue}
              riskFilter={riskFilter}
              setRiskFilter={setRiskFilter}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
            
            <DealHealthTable 
              deals={deals} 
              healthFilterValue={healthFilterValue}
              riskFilter={riskFilter}
              sortOrder={sortOrder}
              onSelectDeal={setSelectedDealId}
            />

            {/* Health History Chart */}
            {selectedDealId && (
              <DealHealthHistoryChart dealId={selectedDealId} />
            )}
          </TabsContent>

          <TabsContent value="alerts">
            <HealthAlertsList showMarkAllRead={true} />
          </TabsContent>

          <TabsContent value="thresholds">
            <HealthThresholdManager userId={user?.id} />
          </TabsContent>

          <TabsContent value="notifications">
            <HealthNotificationSettings userId={user?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DealHealthMonitoring;
