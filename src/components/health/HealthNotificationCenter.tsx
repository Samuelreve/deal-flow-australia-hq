
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  X
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { HealthAlert } from '@/types/healthMonitoring';

interface HealthNotificationCenterProps {
  userId?: string;
}

const HealthNotificationCenter: React.FC<HealthNotificationCenterProps> = ({ userId }) => {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from('deal_health_alerts')
          .select('*')
          .eq('user_id', userId)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        
        const typedAlerts: HealthAlert[] = (data || []).map(alert => ({
          ...alert,
          alert_type: alert.alert_type as 'threshold_breach' | 'score_drop' | 'improvement',
          recommendations: alert.recommendations as Array<{
            area: string;
            recommendation: string;
            impact: 'low' | 'medium' | 'high';
          }>
        }));
        
        setAlerts(typedAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [userId]);

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('deal_health_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'threshold_breach':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'score_drop':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'improvement':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertBadgeVariant = (alertType: string) => {
    switch (alertType) {
      case 'threshold_breach':
        return 'destructive';
      case 'score_drop':
        return 'secondary';
      case 'improvement':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading notifications...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {alerts.length > 0 ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          Notifications
          {alerts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Health alerts and notifications for your deals
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No new notifications</p>
            <p className="text-sm">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  {getAlertIcon(alert.alert_type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getAlertBadgeVariant(alert.alert_type) as any}>
                        {alert.alert_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Score: {alert.current_score}%
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead(alert.id)}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthNotificationCenter;
