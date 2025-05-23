
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Wifi, 
  WifiOff, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  RefreshCw,
  Trash2,
  CheckCircle
} from "lucide-react";
import { useRealTimeHealthMonitoring } from "@/hooks/useRealTimeHealthMonitoring";
import { DealSummary } from "@/types/deal";
import { format } from 'date-fns';

interface RealTimeHealthDashboardProps {
  deals: DealSummary[];
  userId?: string;
  onHealthScoreUpdate?: (dealId: string, newScore: number) => void;
}

const RealTimeHealthDashboard: React.FC<RealTimeHealthDashboardProps> = ({
  deals,
  userId,
  onHealthScoreUpdate
}) => {
  const {
    isConnected,
    realtimeUpdates,
    healthAlerts,
    connectionRetries,
    markAlertAsRead,
    clearOldUpdates
  } = useRealTimeHealthMonitoring({
    deals,
    userId,
    onHealthScoreUpdate
  });

  const getScoreChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'improvement': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decline': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreChangeBadge = (oldScore: number, newScore: number) => {
    const diff = newScore - oldScore;
    if (diff > 0) return <Badge className="bg-green-100 text-green-800">+{diff}%</Badge>;
    if (diff < 0) return <Badge className="bg-red-100 text-red-800">{diff}%</Badge>;
    return <Badge variant="outline">No change</Badge>;
  };

  const getAlertSeverityColor = (alertType: string, currentScore: number) => {
    if (alertType === 'threshold_breach' && currentScore <= 30) return 'text-red-600 bg-red-50';
    if (alertType === 'score_drop') return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const unreadAlerts = healthAlerts.filter(alert => !alert.is_read);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Connection Status & Live Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Real-Time Updates
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm">
                    {connectionRetries > 0 ? `Retrying (${connectionRetries})` : 'Disconnected'}
                  </span>
                </div>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Live health score changes and system status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">
              {realtimeUpdates.length} recent updates
            </span>
            {realtimeUpdates.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearOldUpdates}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <ScrollArea className="h-[300px]">
            {realtimeUpdates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Monitoring for live updates...</p>
                <p className="text-sm">Changes will appear here instantly</p>
              </div>
            ) : (
              <div className="space-y-3">
                {realtimeUpdates.map((update) => (
                  <div key={update.id} className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm">{update.dealTitle}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(update.timestamp, 'HH:mm:ss')}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getScoreChangeIcon(update.changeType)}
                        <span className="text-sm">
                          {update.oldScore}% → {update.newScore}%
                        </span>
                        {getScoreChangeBadge(update.oldScore, update.newScore)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="mt-4 text-xs text-muted-foreground text-center">
            {isConnected 
              ? "🟢 Real-time monitoring active"
              : "🔴 Connection lost • Attempting to reconnect..."
            }
          </div>
        </CardContent>
      </Card>

      {/* Health Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Health Alerts
              {unreadAlerts.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadAlerts.length}
                </Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Threshold breaches and critical health changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {healthAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent health alerts</p>
                <p className="text-sm">All deals are performing well</p>
              </div>
            ) : (
              <div className="space-y-3">
                {healthAlerts.map((alert) => {
                  const deal = deals.find(d => d.id === alert.deal_id);
                  if (!deal) return null;

                  return (
                    <div 
                      key={alert.id} 
                      className={`border rounded-lg p-3 ${getAlertSeverityColor(alert.alert_type, alert.current_score)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-sm">{deal.title}</div>
                        <div className="flex items-center gap-2">
                          {!alert.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAlertAsRead(alert.id)}
                              className="text-xs h-6 px-2"
                            >
                              Mark Read
                            </Button>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(alert.created_at), 'MMM dd, HH:mm')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm mb-2">{alert.message}</div>
                      
                      {alert.recommendations.length > 0 && (
                        <div className="text-xs">
                          <Separator className="my-2" />
                          <div className="font-medium mb-1">Recommendations:</div>
                          {alert.recommendations.slice(0, 2).map((rec, index) => (
                            <div key={index} className="mb-1">
                              • {rec.recommendation}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeHealthDashboard;
