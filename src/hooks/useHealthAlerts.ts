
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HealthAlert } from '@/types/healthMonitoring';
import { toast } from 'sonner';

export const useHealthAlerts = (dealId?: string) => {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      let query = supabase
        .from('deal_health_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (dealId) {
        query = query.eq('deal_id', dealId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Type assertion to ensure proper types
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
      console.error('Error fetching health alerts:', error);
      toast.error('Failed to load health alerts');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('deal_health_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      
      setAlerts(prev => 
        prev.map(alert => alert.id === alertId ? { ...alert, is_read: true } : alert)
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast.error('Failed to mark alert as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadAlerts = alerts.filter(alert => !alert.is_read);
      if (unreadAlerts.length === 0) return;

      const { error } = await supabase
        .from('deal_health_alerts')
        .update({ is_read: true })
        .in('id', unreadAlerts.map(alert => alert.id));

      if (error) throw error;
      
      setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));
      toast.success('All alerts marked as read');
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
      toast.error('Failed to mark alerts as read');
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [dealId]);

  return {
    alerts,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchAlerts
  };
};
