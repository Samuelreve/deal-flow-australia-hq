
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createNotificationSubscription } from "@/services/notificationService";
import { Notification } from "@/types/notifications";
import { toast } from "sonner";

export function useNotificationSubscription(
  onNewNotification: (notification: Notification) => void
) {
  const setupSubscription = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          
          // Convert the notification to our frontend format
          const newNotification: Notification = {
            id: payload.new.id,
            title: payload.new.title,
            message: payload.new.message,
            created_at: payload.new.created_at,
            read: payload.new.read,
            type: payload.new.type,
            deal_id: payload.new.deal_id,
            user_id: payload.new.user_id,
            link: payload.new.link,
            related_entity_id: payload.new.related_entity_id,
            related_entity_type: payload.new.related_entity_type
          };
          
          // Call the provided callback
          onNewNotification(newNotification);
          
          // Show a toast for the new notification
          if (!payload.new.read) {
            toast(newNotification.title, {
              description: newNotification.message,
              action: newNotification.link ? {
                label: "View",
                onClick: () => window.location.href = newNotification.link!
              } : undefined
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewNotification]);

  useEffect(() => {
    const cleanupPromise = setupSubscription();
    
    return () => {
      cleanupPromise?.then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, [setupSubscription]);
}

export default useNotificationSubscription;
