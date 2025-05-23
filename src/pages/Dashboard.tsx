
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Clock, Inbox, AlertCircle, Plus } from "lucide-react";
import { useDeals } from "@/hooks/useDeals";
import { useNotifications } from "@/hooks/useNotifications";
import CreateDealForm from "@/components/deals/CreateDealForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Dashboard = () => {
  const { user } = useAuth();
  const { deals, loading: dealsLoading, metrics } = useDeals();
  const { notifications, unreadCount } = useNotifications();
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  
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
  
  // Get upcoming milestones from real notifications
  const upcomingMilestones = notifications
    .filter(n => !n.read && n.type === 'info')
    .slice(0, 3)
    .map(n => ({
      name: n.title,
      dueDate: "Soon",
      dealName: "Related Deal",
      priority: "medium" as const
    }));

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
        {/* Welcome and header */}
        <div className="mb-8 mt-2 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
            <p className="text-muted-foreground mt-2">
              {currentDate} · Welcome to your personalized deal dashboard
            </p>
          </div>
          <Dialog open={showCreateDeal} onOpenChange={setShowCreateDeal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
              </DialogHeader>
              <CreateDealForm onSuccess={() => setShowCreateDeal(false)} />
            </DialogContent>
          </Dialog>
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
                  <h3 className="text-2xl font-bold mt-1">{unreadCount}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Inbox className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Deals and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Deals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Recent Deals</CardTitle>
              <CardDescription>Your latest business opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              {deals.length > 0 ? (
                <div className="space-y-4">
                  {deals.slice(0, 5).map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="h-2.5 w-2.5 mt-1.5 rounded-full bg-blue-500" />
                        <div>
                          <p className="font-medium">{deal.title}</p>
                          <p className="text-sm text-muted-foreground">{deal.business_name || 'No business name'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge variant={
                          deal.status === 'active' ? 'default' : 
                          deal.status === 'completed' ? 'outline' : 'secondary'
                        }>
                          {deal.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No deals yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowCreateDeal(true)}
                  >
                    Create your first deal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Recent Notifications</CardTitle>
              <CardDescription>Latest updates and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className={`h-2.5 w-2.5 mt-1.5 rounded-full ${
                          notification.read ? 'bg-gray-300' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge variant={
                          notification.type === 'error' ? 'destructive' : 
                          notification.type === 'warning' ? 'default' : 'outline'
                        }>
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No notifications</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
