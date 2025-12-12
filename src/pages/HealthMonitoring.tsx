
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDeals } from "@/hooks/useDeals";
import { useAuth } from "@/contexts/AuthContext";
import { useHealthAlerts } from "@/hooks/useHealthAlerts";
import { convertDealsToDealSummaries } from "@/utils/dealConversion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, Brain, Settings, RefreshCw, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import PerformanceDashboard from "@/components/health/PerformanceDashboard";
import HealthPredictionEngine from "@/components/health/HealthPredictionEngine";
import HealthAlertsList from "@/components/deals/health/HealthAlertsList";
import HealthNotificationSettings from "@/components/deals/health/HealthNotificationSettings";

const HealthMonitoring = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deals: rawDeals, loading: dealsLoading, refreshDeals } = useDeals();
  const { alerts } = useHealthAlerts();

  const deals = React.useMemo(() => convertDealsToDealSummaries(rawDeals), [rawDeals]);
  
  // Calculate metrics
  const metrics = React.useMemo(() => {
    const total = deals.length;
    const avgScore = total > 0 
      ? Math.round(deals.reduce((sum, d) => sum + d.healthScore, 0) / total) 
      : 0;
    const critical = deals.filter(d => d.healthScore < 30).length;
    const warning = deals.filter(d => d.healthScore >= 30 && d.healthScore < 70).length;
    const healthy = deals.filter(d => d.healthScore >= 70).length;
    return { total, avgScore, critical, warning, healthy };
  }, [deals]);

  const unreadAlerts = alerts.filter(a => !a.is_read).length;

  if (dealsLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-pulse mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Loading health monitoring...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Health Monitoring
          </h1>
          <p className="text-muted-foreground">
            AI-powered insights into your deal portfolio
          </p>
        </div>
        <Button variant="outline" onClick={() => refreshDeals()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/deals')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{metrics.avgScore}%</p>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">{metrics.critical}</p>
              </div>
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Warning</p>
                <p className="text-2xl font-bold text-warning">{metrics.warning}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Healthy</p>
                <p className="text-2xl font-bold text-success">{metrics.healthy}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
            {unreadAlerts > 0 && (
              <Badge variant="destructive" className="text-xs h-5 px-1.5">
                {unreadAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Predictions
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <PerformanceDashboard deals={deals} />
        </TabsContent>

        <TabsContent value="alerts">
          <HealthAlertsList maxItems={20} showMarkAllRead={true} />
        </TabsContent>

        <TabsContent value="predictions">
          <HealthPredictionEngine deals={deals} userId={user?.id} />
        </TabsContent>

        <TabsContent value="settings">
          <HealthNotificationSettings userId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthMonitoring;
