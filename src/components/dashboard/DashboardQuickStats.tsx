
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Clock, Inbox, AlertCircle } from "lucide-react";

interface DashboardQuickStatsProps {
  metrics: {
    active: number;
    averageHealthScore: number;
  };
  recentActivityCount: number;
  unreadCount: number;
}

const DashboardQuickStats = ({ metrics, recentActivityCount, unreadCount }: DashboardQuickStatsProps) => {
  return (
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
  );
};

export default DashboardQuickStats;
