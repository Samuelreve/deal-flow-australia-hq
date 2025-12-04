
import React, { useState, useEffect } from "react";
import DashboardWelcomeHeader from "@/components/dashboard/DashboardWelcomeHeader";
import DashboardQuickStats from "@/components/dashboard/DashboardQuickStats";
import DashboardRecentDeals from "@/components/dashboard/DashboardRecentDeals";
import DashboardRecentNotifications from "@/components/dashboard/DashboardRecentNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useDeals } from "@/hooks/useDeals";
import { useNotifications } from "@/hooks/useNotifications";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { deals, loading: dealsLoading, metrics } = useDeals();
  const { notifications, unreadCount } = useNotifications();
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
  }, [user]);

  // Get recent activity from real deals
  const recentActivityCount = deals.filter(deal => {
    const updatedDate = new Date(deal.updated_at);
    const today = new Date();
    const differenceInDays = Math.floor((today.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24));
    return differenceInDays < 7;
  }).length;

  if (dealsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardWelcomeHeader 
        welcomeMessage={welcomeMessage}
        currentDate={currentDate}
      />
      
      <DashboardQuickStats 
        metrics={metrics}
        recentActivityCount={recentActivityCount}
        unreadCount={unreadCount}
      />
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Recent Deals */}
        <div className="space-y-6 animate-fade-in stagger-1">
          <DashboardRecentDeals deals={deals} />
        </div>
        
        {/* Right Column - Notifications */}
        <div className="animate-fade-in stagger-2">
          <DashboardRecentNotifications notifications={notifications} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
