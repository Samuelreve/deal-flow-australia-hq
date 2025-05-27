
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import DashboardWelcomeHeader from "@/components/dashboard/DashboardWelcomeHeader";
import DashboardQuickStats from "@/components/dashboard/DashboardQuickStats";
import DashboardRecentDeals from "@/components/dashboard/DashboardRecentDeals";
import DashboardRecentNotifications from "@/components/dashboard/DashboardRecentNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useDeals } from "@/hooks/useDeals";
import { useNotifications } from "@/hooks/useNotifications";

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
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
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
          {/* Left Column - Recent Deals and Contract Analysis */}
          <div className="space-y-6">
            <DashboardRecentDeals deals={deals} />
          </div>
          
          {/* Right Column - Notifications */}
          <div>
            <DashboardRecentNotifications notifications={notifications} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
