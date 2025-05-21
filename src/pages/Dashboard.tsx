
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DealFilters from "@/components/dashboard/DealFilters";
import DealMetrics from "@/components/dashboard/DealMetrics";
import DealsDashboard from "@/components/deals/DealsDashboard";
import { useDeals } from "@/hooks/useDeals";
import { useAuth } from "@/contexts/AuthContext";
import DealInsightsPanel from "@/components/dashboard/DealInsightsPanel";
import { toast } from "sonner";
import { useDocumentAI } from "@/hooks/document-ai";
import DealHealthPredictionPanel from "@/components/deals/health/DealHealthPredictionPanel";
import SmartContractPanel from "@/components/dashboard/SmartContractPanel";

const Dashboard = () => {
  const { user } = useAuth();
  const { deals, loading, filteredDeals, statusFilter, setStatusFilter, searchTerm, setSearchTerm, sortBy, setSortBy, sortOrder, setSortOrder, metrics, averageHealthScore } = useDeals();
  const [welcomeMessage, setWelcomeMessage] = useState("");

  useEffect(() => {
    // Get time of day for personalized greeting
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    
    const name = user?.profile?.name || "there";
    setWelcomeMessage(`${greeting}, ${name}!`);
    
    // Show error message if deals failed to load
    if (loading === false && deals.length === 0) {
      toast.error("Failed to load deals", {
        description: "Please try refreshing the page."
      });
    }
  }, [user, deals, loading]);

  // Get active deals sorted by health
  const activeDealsSortedByHealth = [...filteredDeals]
    .filter(deal => deal.status === "active")
    .sort((a, b) => a.healthScore - b.healthScore);
  
  // Get the deal with the lowest health score
  const needsAttentionDeal = activeDealsSortedByHealth[0];

  return (
    <AppLayout>
      <div className="container mx-auto px-4">
        {/* Welcome and header */}
        <div className="mb-8 mt-2">
          <h1 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
          <p className="text-muted-foreground mt-2">
            Your deal dashboard provides a real-time overview of all your active and pending deals.
          </p>
        </div>
        
        {/* Metrics section */}
        <div className="mb-8">
          <DealMetrics 
            total={metrics.total}
            active={metrics.active}
            completed={metrics.completed}
            pending={metrics.pending}
            draft={metrics.draft}
            cancelled={metrics.cancelled}
            loading={loading}
            averageHealth={metrics.averageHealthScore}
          />
        </div>
        
        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deals list area - takes 2/3 of the space on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <DashboardHeader 
              title="Your Deals" 
              subtitle="View and manage all your business deals"
            />
            
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
            <DealsDashboard deals={filteredDeals} />
          </div>
          
          {/* Sidebar area - takes 1/3 of the space on large screens */}
          <div className="space-y-6">
            <SmartContractPanel dealId={needsAttentionDeal?.id} />
            <DealInsightsPanel />
            
            {/* Render Deal Health Prediction Panel if there are active deals */}
            {needsAttentionDeal && (
              <DealHealthPredictionPanel dealId={needsAttentionDeal.id} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
