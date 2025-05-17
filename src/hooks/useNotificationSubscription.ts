
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createNotificationSubscription } from "@/services/notificationService";
import { Notification } from "@/types/notifications";
import { toast } from "@/components/ui/sonner";

export function useNotificationSubscription(
  onNewNotification: (notification: Notification) => void
) {
  const setupSubscription = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    return createNotificationSubscription(
      session.user.id,
      (newNotification) => {
        // Call the provided callback
        onNewNotification(newNotification);
        
        // Show a toast for the new notification
        if (!newNotification.read) {
          toast({
            title: newNotification.title,
            description: newNotification.message,
            action: newNotification.link ? {
              label: "View",
              onClick: () => window.location.href = newNotification.link!
            } : undefined
          });
        }
      }
    );
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
