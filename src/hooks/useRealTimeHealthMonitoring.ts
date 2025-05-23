
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DealSummary } from '@/types/deal';
import { HealthAlert } from '@/types/healthMonitoring';
import { toast } from 'sonner';

interface RealTimeUpdate {
  id: string;
  dealId: string;
  dealTitle: string;
  oldScore: number;
  newScore: number;
  changeType: 'improvement' | 'decline' | 'stable';
  timestamp: Date;
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
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealTimeUpdate[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [connectionRetries, setConnectionRetries] = useState(0);

  const addRealtimeUpdate = useCallback((update: RealTimeUpdate) => {
    setRealtimeUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
    
    // Show toast notification
    const changeText = update.newScore > update.oldScore ? 'improved' : 'declined';
    toast.info(`${update.dealTitle} health score ${changeText} to ${update.newScore}%`);
    
    // Call callback if provided
    if (onHealthScoreUpdate) {
      onHealthScoreUpdate(update.dealId, update.newScore);
    }
  }, [onHealthScoreUpdate]);

  const markAlertAsRead = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('deal_health_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      
      setHealthAlerts(prev => 
        prev.map(alert => alert.id === alertId ? { ...alert, is_read: true } : alert)
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }, []);

  const clearOldUpdates = useCallback(() => {
    setRealtimeUpdates([]);
  }, []);

  // Fetch initial health alerts
  useEffect(() => {
    const fetchHealthAlerts = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from('deal_health_alerts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

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
        
        setHealthAlerts(typedAlerts);
      } catch (error) {
        console.error('Error fetching health alerts:', error);
      }
    };

    fetchHealthAlerts();
  }, [userId]);

  // Set up real-time subscription for deal health changes
  useEffect(() => {
    if (!userId || deals.length === 0) return;

    const dealIds = deals.map(d => d.id);
    
    const channel = supabase
      .channel('deal-health-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deals',
          filter: `id=in.(${dealIds.join(',')})`
        },
        (payload) => {
          const updatedDeal = payload.new as any;
          const oldDeal = payload.old as any;
          
          if (updatedDeal.health_score !== oldDeal.health_score) {
            const deal = deals.find(d => d.id === updatedDeal.id);
            if (deal) {
              const changeType = updatedDeal.health_score > oldDeal.health_score 
                ? 'improvement' 
                : updatedDeal.health_score < oldDeal.health_score 
                  ? 'decline' 
                  : 'stable';

              addRealtimeUpdate({
                id: `${updatedDeal.id}-${Date.now()}`,
                dealId: updatedDeal.id,
                dealTitle: deal.title,
                oldScore: oldDeal.health_score,
                newScore: updatedDeal.health_score,
                changeType,
                timestamp: new Date()
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deal_health_alerts',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newAlert = payload.new as any;
          const typedAlert: HealthAlert = {
            ...newAlert,
            alert_type: newAlert.alert_type as 'threshold_breach' | 'score_drop' | 'improvement',
            recommendations: newAlert.recommendations as Array<{
              area: string;
              recommendation: string;
              impact: 'low' | 'medium' | 'high';
            }>
          };
          
          setHealthAlerts(prev => [typedAlert, ...prev]);
          toast.error(`Health Alert: ${newAlert.message}`);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'CHANNEL_ERROR') {
          setConnectionRetries(prev => prev + 1);
          setTimeout(() => {
            channel.subscribe();
          }, 1000 * Math.pow(2, connectionRetries)); // Exponential backoff
        } else if (status === 'SUBSCRIBED') {
          setConnectionRetries(0);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, deals, addRealtimeUpdate, connectionRetries]);

  return {
    isConnected,
    realtimeUpdates,
    healthAlerts,
    connectionRetries,
    markAlertAsRead,
    clearOldUpdates
  };
};
