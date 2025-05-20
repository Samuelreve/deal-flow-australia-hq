
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import DealsDashboard from "@/components/deals/DealsDashboard";
import DealMetrics from "@/components/dashboard/DealMetrics";
import DealFilters from "@/components/dashboard/DealFilters";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DealsByStatusChart from "@/components/dashboard/DealsByStatusChart";
import HealthScoreChart from "@/components/dashboard/HealthScoreChart";
import DealInsightsPanel from "@/components/dashboard/DealInsightsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeals } from "@/hooks/useDeals";
import { useMemo } from "react";
import { DealSummary } from "@/types/deal";
import { formatDate } from "@/utils/formatDate";

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    filteredDeals,
    loading,
    statusFilter,
    setStatusFilter,
    searchTerm, 
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    activeDeals,
    averageHealthScore
  } = useDeals(user?.id);
  
  // Calculate deal status chart data
  const dealsByStatusChartData = useMemo(() => {
    if (loading || !filteredDeals.length) return [];
    
    const statusCounts: Record<string, number> = {};
    filteredDeals.forEach(deal => {
      statusCounts[deal.status] = (statusCounts[deal.status] || 0) + 1;
    });
    
    const statusColors: Record<string, string> = {
      active: "#22c55e",    // green
      pending: "#f59e0b",   // amber
      completed: "#3b82f6", // blue
      draft: "#9ca3af",     // gray
      cancelled: "#ef4444"  // red
    };
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: statusColors[status] || "#9ca3af"
    }));
  }, [filteredDeals, loading]);

  // Calculate health score distribution
  const healthScoreDistribution = useMemo(() => {
    if (loading || !activeDeals.length) return [];
    
    // Define the ranges
    const ranges = [
      { min: 0, max: 25, label: "0-25" },
      { min: 26, max: 50, label: "26-50" },
      { min: 51, max: 75, label: "51-75" },
      { min: 76, max: 100, label: "76-100" }
    ];
    
    // Count deals in each range
    const distribution = ranges.map(range => {
      const count = activeDeals.filter(
        deal => deal.healthScore >= range.min && deal.healthScore <= range.max
      ).length;
      
      return {
        range: range.label,
        count
      };
    });
    
    return distribution;
  }, [activeDeals, loading]);
  
  // Determine if user has enough deals for insights
  const shouldShowInsights = filteredDeals.length > 0;
  
  // Current date for welcome message
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);
  
  return (
    <AppLayout>
      {/* Welcome section with date */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Welcome back</h1>
        <p className="text-muted-foreground">{formattedDate}</p>
      </div>
      
      {/* Dashboard Header with action buttons */}
      <DashboardHeader 
        title="Business Overview" 
        subtitle="Monitor your deal activity and performance" 
      />
      
      {/* Metrics Cards */}
      <DealMetrics 
        total={filteredDeals.length}
        active={activeDeals.length}
        completed={filteredDeals.filter(d => d.status === "completed").length}
        pending={filteredDeals.filter(d => d.status === "pending").length}
        loading={loading}
        averageHealth={averageHealthScore}
      />
      
      {/* AI Deal Insights Panel */}
      {shouldShowInsights && <DealInsightsPanel />}
      
      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Deal Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DealsByStatusChart data={dealsByStatusChartData} />
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Health Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthScoreChart data={healthScoreDistribution} />
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and Sorting */}
      <DealFilters 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      
      {/* Deals List */}
      <DealsDashboard deals={filteredDeals} />
    </AppLayout>
  );
};

export default Dashboard;
