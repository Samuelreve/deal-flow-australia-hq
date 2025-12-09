
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useDeals } from "@/hooks/useDeals";
import { useAuth } from "@/contexts/AuthContext";
import HealthScoreOverviewChart from "@/components/deals/health/HealthScoreOverviewChart";
import DealHealthHistoryChart from "@/components/deals/health/DealHealthHistoryChart";
import HealthAlertsList from "@/components/deals/health/HealthAlertsList";
import HealthThresholdManager from "@/components/deals/health/HealthThresholdManager";
import HealthNotificationSettings from "@/components/deals/health/HealthNotificationSettings";
import DealHealthTable from "@/components/deals/health/DealHealthTable";
import DealHealthFilters from "@/components/deals/health/DealHealthFilters";
import { useNavigate } from "react-router-dom";
import { Zap, BarChart3 } from "lucide-react";
import { convertDealsToDealSummaries } from "@/utils/dealConversion";

const DealHealthMonitoring = () => {
  const { user } = useAuth();
  const { deals, loading } = useDeals();
  const navigate = useNavigate();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [healthFilterValue, setHealthFilterValue] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Convert deals to DealSummary format
  const dealSummaries = convertDealsToDealSummaries(deals);

  // Find the deal with the lowest health score
  useEffect(() => {
    if (dealSummaries.length > 0 && !selectedDealId) {
      const lowestHealthDeal = [...dealSummaries]
        .filter(d => d.status === 'active')
        .sort((a, b) => a.healthScore - b.healthScore)[0];
        
      if (lowestHealthDeal) {
        setSelectedDealId(lowestHealthDeal.id);
      }
    }
  }, [dealSummaries, selectedDealId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Deal Health Monitoring</h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage the health of all your business deals in one place
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/advanced-health-monitoring')}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Advanced Features
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Advanced Features Promotion */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <BarChart3 className="h-5 w-5" />
                New Advanced Health Features Available!
              </CardTitle>
              <CardDescription>
                Discover AI predictions, custom metrics, recovery plans, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  🔮 AI Predictions
                </span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  📊 Custom Metrics
                </span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  💡 Recovery Plans
                </span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  📈 Deal Comparison
                </span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  📄 Automated Reports
                </span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  ⚡ Real-time Updates
                </span>
              </div>
              <Button 
                onClick={() => navigate('/advanced-health-monitoring')}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Explore Advanced Features
              </Button>
            </CardContent>
          </Card>

          {/* Health Score Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Health Score Overview</CardTitle>
              <CardDescription>
                Average health score across all your active deals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HealthScoreOverviewChart deals={dealSummaries} />
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
            deals={dealSummaries} 
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
          <HealthThresholdManager dealId={selectedDealId || undefined} userId={user?.id} />
        </TabsContent>

        <TabsContent value="notifications">
          <HealthNotificationSettings userId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DealHealthMonitoring;
