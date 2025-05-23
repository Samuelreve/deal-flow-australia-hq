
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useHealthAlerts } from '@/hooks/useHealthAlerts';
import { formatDistanceToNow } from 'date-fns';

interface HealthAlertsListProps {
  dealId?: string;
  maxItems?: number;
  showMarkAllRead?: boolean;
}

const HealthAlertsList: React.FC<HealthAlertsListProps> = ({ 
  dealId, 
  maxItems = 10,
  showMarkAllRead = true 
}) => {
  const { alerts, loading, markAsRead, markAllAsRead } = useHealthAlerts(dealId);

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'threshold_breach': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'score_drop': return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case 'improvement': return <TrendingUp className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (alertType: string) => {
    switch (alertType) {
      case 'threshold_breach': return 'destructive';
      case 'score_drop': return 'default';
      case 'improvement': return 'secondary';
      default: return 'outline';
    }
  };

  const displayedAlerts = alerts.slice(0, maxItems);
  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Alerts</CardTitle>
          <CardDescription>Loading alerts...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Health Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Recent health score changes and threshold alerts
            </CardDescription>
          </div>
          
          {showMarkAllRead && unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {displayedAlerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>No health alerts - your deals are looking good!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg ${
                  alert.is_read ? 'bg-muted/30' : 'bg-background'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.alert_type)}
                    <Badge variant={getAlertVariant(alert.alert_type) as any}>
                      {alert.alert_type.replace('_', ' ')}
                    </Badge>
                    {!alert.is_read && (
                      <Badge variant="outline" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </div>
                </div>
                
                <p className="text-sm mb-3">{alert.message}</p>
                
                {alert.recommendations.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Recommended Actions:
                    </p>
                    {alert.recommendations.map((rec, index) => (
                      <div key={index} className="text-xs bg-muted/50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rec.area}:</span>
                          <Badge 
                            variant="outline" 
                            className="text-[10px] h-4"
                          >
                            {rec.impact} impact
                          </Badge>
                        </div>
                        <p className="mt-1 text-muted-foreground">{rec.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {!alert.is_read && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead(alert.id)}
                    className="text-xs"
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthAlertsList;
