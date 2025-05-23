
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Inbox, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { deals, loading, filteredDeals, statusFilter, setStatusFilter, searchTerm, setSearchTerm, sortBy, setSortBy, sortOrder, setSortOrder, metrics } = useDeals();
  const [welcomeMessage, setWelcomeMessage] = useState("");
  
  // Get current date for dashboard information
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
  
  // Calculate recent activity
  const recentActivityCount = deals.filter(deal => {
    const updatedDate = new Date(deal.updatedAt);
    const today = new Date();
    const differenceInDays = Math.floor((today.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24));
    return differenceInDays < 7; // Updated in the last 7 days
  }).length;
  
  // Get upcoming milestones (mock data for demonstration)
  const upcomingMilestones = [
    { name: "Contract Review", dueDate: "Tomorrow", dealName: "Business Acquisition", priority: "high" },
    { name: "Financial Verification", dueDate: "In 3 days", dealName: "Property Sale", priority: "medium" },
    { name: "Final Agreement", dueDate: "Next week", dealName: "Partnership Deal", priority: "low" }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Welcome and header */}
        <div className="mb-8 mt-2">
          <h1 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
          <p className="text-muted-foreground mt-2">
            {currentDate} · Welcome to your personalized deal dashboard
          </p>
        </div>
        
        {/* Quick stats section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                  <h3 className="text-2xl font-bold mt-1">{metrics.active}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                  <h3 className="text-2xl font-bold mt-1">{recentActivityCount}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Health</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {metrics.averageHealthScore ? `${metrics.averageHealthScore}%` : 'N/A'}
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
                  <h3 className="text-2xl font-bold mt-1">3</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Inbox className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Upcoming tasks/milestones */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Upcoming Milestones</CardTitle>
              <CardDescription>Tasks that require your attention</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMilestones.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMilestones.map((milestone, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className={`h-2.5 w-2.5 mt-1.5 rounded-full ${
                          milestone.priority === 'high' ? 'bg-red-500' : 
                          milestone.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium">{milestone.name}</p>
                          <p className="text-sm text-muted-foreground">{milestone.dealName}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge variant={
                          milestone.priority === 'high' ? 'destructive' : 
                          milestone.priority === 'medium' ? 'default' : 'outline'
                        }>
                          {milestone.dueDate}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No upcoming milestones</p>
              )}
            </CardContent>
          </Card>
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
