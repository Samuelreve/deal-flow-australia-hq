
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RealtimeConfig {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onUpdate?: (payload: any) => void;
  onInsert?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  showToasts?: boolean;
}

export const useRealtimeUpdates = (config: RealtimeConfig[]) => {
  const { user } = useAuth();

  const handleRealtimeEvent = useCallback((
    event: string,
    payload: any,
    handlers: Pick<RealtimeConfig, 'onUpdate' | 'onInsert' | 'onDelete' | 'showToasts'>
  ) => {
    console.log(`Realtime ${event}:`, payload);

    switch (event) {
      case 'INSERT':
        handlers.onInsert?.(payload);
        if (handlers.showToasts) {
          toast.success('New data added');
        }
        break;
      case 'UPDATE':
        handlers.onUpdate?.(payload);
        if (handlers.showToasts) {
          toast.info('Data updated');
        }
        break;
      case 'DELETE':
        handlers.onDelete?.(payload);
        if (handlers.showToasts) {
          toast.info('Data removed');
        }
        break;
    }
  }, []);

  useEffect(() => {
    if (!user?.id || config.length === 0) return;

    const channels = config.map((cfg, index) => {
      const channelName = `realtime-${cfg.table}-${index}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: cfg.event || '*',
            schema: 'public',
            table: cfg.table,
            filter: cfg.filter
          } as any,
          (payload) => handleRealtimeEvent(payload.eventType, payload, cfg)
        )
        .subscribe();

      return channel;
    });

    // Cleanup function
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [user?.id, config, handleRealtimeEvent]);

  const subscribeToTable = useCallback((tableConfig: RealtimeConfig) => {
    if (!user?.id) return null;

    const channel = supabase
      .channel(`realtime-${tableConfig.table}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: tableConfig.event || '*',
          schema: 'public',
          table: tableConfig.table,
          filter: tableConfig.filter
        } as any,
        (payload) => handleRealtimeEvent(payload.eventType, payload, tableConfig)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id, handleRealtimeEvent]);

  return { subscribeToTable };
};

// Specific hooks for common use cases
export const useDealsRealtime = (onUpdate?: (deal: any) => void) => {
  const { user } = useAuth();
  
  useRealtimeUpdates([
    {
      table: 'deals',
      filter: user?.id ? `seller_id=eq.${user.id}` : undefined,
      onUpdate,
      showToasts: true
    }
  ]);
};

export const useNotificationsRealtime = (onNewNotification?: (notification: any) => void) => {
  const { user } = useAuth();
  
  useRealtimeUpdates([
    {
      table: 'notifications',
      event: 'INSERT',
      filter: user?.id ? `user_id=eq.${user.id}` : undefined,
      onInsert: onNewNotification,
      showToasts: false // Handle notification toasts separately
    }
  ]);
};

export const useHealthAlertsRealtime = (onNewAlert?: (alert: any) => void) => {
  const { user } = useAuth();
  
  useRealtimeUpdates([
    {
      table: 'deal_health_alerts',
      event: 'INSERT',
      filter: user?.id ? `user_id=eq.${user.id}` : undefined,
      onInsert: onNewAlert,
      showToasts: true
    }
  ]);
};
