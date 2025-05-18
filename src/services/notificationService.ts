
import { supabase } from "@/integrations/supabase/client";
import { DbNotification, Notification } from "@/types/notifications";
import { toast } from "sonner";

export async function fetchNotifications(): Promise<Notification[] | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    // Transform to match our Notification type
    return data.map(n => mapNotificationFromDb(n));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    toast("Failed to load notifications", {
      description: "An error occurred while loading notifications"
    });
    return null;
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", session.user.id)
      .eq("read", false);
    
    if (error) throw error;
    
    toast("Notifications Updated", {
      description: "All notifications marked as read"
    });
    return true;
  } catch (error) {
    console.error("Error marking all as read:", error);
    toast("Operation Failed", {
      description: "Failed to mark all as read"
    });
    return false;
  }
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);
    
    if (error) throw error;
    
    toast("Notification Removed", {
      description: "The notification has been removed"
    });
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    toast("Operation Failed", {
      description: "Failed to remove notification"
    });
    return false;
  }
}

// Helper to convert DB notification to our app's Notification type
export function mapNotificationFromDb(n: DbNotification): Notification {
  return {
    id: n.id,
    user_id: n.user_id,
    deal_id: n.deal_id || null,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    created_at: n.created_at,
    related_entity_id: n.related_entity_id || null,
    related_entity_type: n.related_entity_type || null,
    link: n.link || null
  };
}

// Setup realtime subscription for new notifications
export function createNotificationSubscription(
  userId: string, 
  onNewNotification: (notification: Notification) => void
) {
  const channel = supabase
    .channel('public:notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log("New notification received:", payload);
        
        // Format the notification
        const newNotification = mapNotificationFromDb(payload.new as DbNotification);
        
        // Call the callback with the new notification
        onNewNotification(newNotification);
      }
    )
    .subscribe();
    
  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}
