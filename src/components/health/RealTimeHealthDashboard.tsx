
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  WifiOff, 
  Wifi, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  RefreshCw
} from "lucide-react";
import { DealSummary } from "@/types/deal";
import { useRealTimeHealthMonitoring } from "@/hooks/useRealTimeHealthMonitoring";

interface RealTimeHealthDashboardProps {
  deals: DealSummary[];
  userId?: string;
  onHealthScoreUpdate: (dealId: string, newScore: number) => void;
}

const RealTimeHealthDashboard: React.FC<RealTimeHealthDashboardProps> = ({ 
  deals, 
  userId, 
  onHealthScoreUpdate 
}) => {
  const { 
    isConnected, 
    realtimeUpdates, 
    connectionRetries, 
    clearOldUpdates 
  } = useRealTimeHealthMonitoring({
    deals,
    userId,
    onHealthScoreUpdate
  });

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'improvement':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decline':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'improvement':
        return 'text-green-600';
      case 'decline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Real-Time Connection
          </CardTitle>
          <CardDescription>
            {isConnected ? 'Connected to real-time updates' : 'Disconnected from real-time updates'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </Badge>
              {connectionRetries > 0 && (
                <span className="text-sm text-muted-foreground">
                  Retries: {connectionRetries}
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Monitoring {deals.length} deals
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Updates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Updates
              </CardTitle>
              <CardDescription>
                Live health score changes across your deals
              </CardDescription>
            </div>
            {realtimeUpdates.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearOldUpdates}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {realtimeUpdates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent updates</p>
              <p className="text-sm">Real-time changes will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {realtimeUpdates.map((update) => (
                <div key={update.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getChangeIcon(update.changeType)}
                    <div>
                      <p className="font-medium">{update.dealTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {update.oldScore}% → {update.newScore}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${getChangeColor(update.changeType)}`}>
                      {update.newScore > update.oldScore ? '+' : ''}
                      {update.newScore - update.oldScore}%
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {update.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeHealthDashboard;
