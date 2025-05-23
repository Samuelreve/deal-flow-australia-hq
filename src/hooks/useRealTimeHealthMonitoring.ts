
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DealSummary } from '@/types/deal';
import { HealthAlert } from '@/types/healthMonitoring';

interface RealTimeHealthUpdate {
  id: string;
  dealId: string;
  dealTitle: string;
  oldScore: number;
  newScore: number;
  timestamp: Date;
  changeType: 'improvement' | 'decline' | 'stable';
}

interface UseRealTimeHealthMonitoringProps {
  deals: DealSummary[];
  userId?: string;
  onHealthScoreUpdate?: (dealId: string, newScore: number) => void;
}

export const useRealTimeHealthMonitoring = ({
  deals,
  userId,
  onHealthScoreUpdate
}: UseRealTimeHealthMonitoringProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealTimeHealthUpdate[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [connectionRetries, setConnectionRetries] = useState(0);

  const addRealtimeUpdate = useCallback((update: RealTimeHealthUpdate) => {
    setRealtimeUpdates(prev => [update, ...prev.slice(0, 19)]); // Keep last 20 updates
  }, []);

  const showHealthNotification = useCallback((
    deal: DealSummary,
    oldScore: number,
    newScore: number
  ) => {
    const scoreDiff = newScore - oldScore;
    const isImprovement = scoreDiff > 0;
    const isSignificantChange = Math.abs(scoreDiff) >= 5;

    if (!isSignificantChange) return;

    const notificationConfig = {
      title: `${deal.title}: Health Score ${isImprovement ? 'Improved' : 'Declined'}`,
      description: `${isImprovement ? '+' : ''}${scoreDiff}% change (${oldScore}% → ${newScore}%)`,
      duration: isImprovement ? 5000 : 8000,
    };

    if (isImprovement) {
      toast.success(notificationConfig.title, {
        description: notificationConfig.description,
        duration: notificationConfig.duration
      });
    } else {
      toast.warning(notificationConfig.title, {
        description: notificationConfig.description,
        duration: notificationConfig.duration
      });
    }
  }, []);

  const setupRealtimeSubscription = useCallback(() => {
    if (!userId || deals.length === 0) return null;

    console.log('Setting up real-time health monitoring subscription...');

    const channel = supabase
      .channel('health-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deals',
          filter: 'health_score=neq.null'
        },
        (payload: any) => {
          console.log('Real-time health score update received:', payload);
          
          const { new: newDeal, old: oldDeal } = payload;
          const deal = deals.find(d => d.id === newDeal.id);
          
          if (!deal || newDeal.health_score === oldDeal.health_score) return;

          const oldScore = oldDeal.health_score || 0;
          const newScore = newDeal.health_score || 0;
          const scoreDiff = newScore - oldScore;

          // Create update record
          const update: RealTimeHealthUpdate = {
            id: `${newDeal.id}-${Date.now()}`,
            dealId: newDeal.id,
            dealTitle: deal.title,
            oldScore,
            newScore,
            timestamp: new Date(),
            changeType: scoreDiff > 0 ? 'improvement' : scoreDiff < 0 ? 'decline' : 'stable'
          };

          addRealtimeUpdate(update);

          // Call parent callback
          if (onHealthScoreUpdate) {
            onHealthScoreUpdate(newDeal.id, newScore);
          }

          // Show notification
          showHealthNotification(deal, oldScore, newScore);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deal_health_alerts'
        },
        (payload: any) => {
          console.log('New health alert received:', payload);
          
          const alert = payload.new;
          const deal = deals.find(d => d.id === alert.deal_id);
          
          if (!deal || alert.user_id !== userId) return;

          // Add to alerts list
          const newAlert: HealthAlert = {
            id: alert.id,
            deal_id: alert.deal_id,
            user_id: alert.user_id,
            alert_type: alert.alert_type,
            threshold_value: alert.threshold_value,
            current_score: alert.current_score,
            previous_score: alert.previous_score,
            message: alert.message,
            recommendations: alert.recommendations || [],
            is_read: false,
            created_at: alert.created_at
          };

          setHealthAlerts(prev => [newAlert, ...prev]);

          // Show critical notification
          const severity = alert.alert_type === 'threshold_breach' && alert.threshold_value <= 30 
            ? 'error' 
            : 'warning';

          if (severity === 'error') {
            toast.error(`Critical Alert: ${deal.title}`, {
              description: alert.message,
              duration: 10000
            });
          } else {
            toast.warning(`Health Alert: ${deal.title}`, {
              description: alert.message,
              duration: 8000
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          setConnectionRetries(0);
          toast.success('Real-time monitoring active', {
            description: 'You\'ll receive live health updates',
            duration: 3000
          });
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionRetries(prev => prev + 1);
          toast.error('Connection lost', {
            description: 'Attempting to reconnect...',
            duration: 2000
          });
        }
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [deals, userId, onHealthScoreUpdate, addRealtimeUpdate, showHealthNotification]);

  // Auto-retry connection
  useEffect(() => {
    if (connectionRetries > 0 && connectionRetries < 5) {
      const retryTimeout = setTimeout(() => {
        console.log(`Retrying connection (attempt ${connectionRetries + 1})`);
        setupRealtimeSubscription();
      }, Math.pow(2, connectionRetries) * 1000); // Exponential backoff

      return () => clearTimeout(retryTimeout);
    }
  }, [connectionRetries, setupRealtimeSubscription]);

  // Setup subscription
  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    return cleanup || (() => {});
  }, [setupRealtimeSubscription]);

  const markAlertAsRead = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('deal_health_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setHealthAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }, []);

  const clearOldUpdates = useCallback(() => {
    setRealtimeUpdates([]);
  }, []);

  return {
    isConnected,
    realtimeUpdates,
    healthAlerts,
    connectionRetries,
    markAlertAsRead,
    clearOldUpdates
  };
};
