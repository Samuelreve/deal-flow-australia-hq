
import { supabase } from "@/integrations/supabase/client";
import { DbNotification, Notification } from "@/types/notifications";
import { toast } from "sonner";

interface NotificationSettings {
  inapp_deal_updates: boolean;
  inapp_messages: boolean;
  inapp_document_comments: boolean;
}

// Fetch user's notification settings
async function getUserNotificationSettings(userId: string): Promise<NotificationSettings> {
  const { data } = await supabase
    .from('notification_settings')
    .select('inapp_deal_updates, inapp_messages, inapp_document_comments')
    .eq('user_id', userId)
    .single();
  
  // Default to all enabled if no settings exist
  return data || {
    inapp_deal_updates: true,
    inapp_messages: true,
    inapp_document_comments: true
  };
}

// Categorize notification based on its content
function getNotificationCategory(notification: Notification): 'deal_updates' | 'messages' | 'document_comments' {
  const title = notification.title.toLowerCase();
  const type = notification.type?.toLowerCase() || '';
  
  if (title.includes('message') || type.includes('message')) return 'messages';
  if (title.includes('comment') || type.includes('comment')) return 'document_comments';
  
  // Default: deal updates (health alerts, invitations, milestone changes, etc.)
  return 'deal_updates';
}

// Filter notifications based on user settings
function filterNotificationsBySettings(
  notifications: Notification[], 
  settings: NotificationSettings
): Notification[] {
  return notifications.filter(n => {
    const category = getNotificationCategory(n);
    if (category === 'deal_updates' && !settings.inapp_deal_updates) return false;
    if (category === 'messages' && !settings.inapp_messages) return false;
    if (category === 'document_comments' && !settings.inapp_document_comments) return false;
    return true;
  });
}

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
    
    // Fetch user's notification settings
    const settings = await getUserNotificationSettings(session.user.id);
    
    // Transform and filter notifications based on settings
    const notifications = data.map(n => mapNotificationFromDb(n));
    return filterNotificationsBySettings(notifications, settings);
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
  // Cache settings to avoid fetching on every notification
  let cachedSettings: NotificationSettings | null = null;
  
  // Fetch settings initially
  getUserNotificationSettings(userId).then(settings => {
    cachedSettings = settings;
  });
  
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
      async (payload) => {
        console.log("New notification received:", payload);
        
        // Format the notification
        const newNotification = mapNotificationFromDb(payload.new as DbNotification);
        
        // Refresh settings cache on new notification
        const settings = await getUserNotificationSettings(userId);
        cachedSettings = settings;
        
        // Check if this notification type is enabled
        const category = getNotificationCategory(newNotification);
        const shouldShow = 
          (category === 'deal_updates' && settings.inapp_deal_updates) ||
          (category === 'messages' && settings.inapp_messages) ||
          (category === 'document_comments' && settings.inapp_document_comments);
        
        if (shouldShow) {
          // Call the callback with the new notification
          onNewNotification(newNotification);
        }
      }
    )
    .subscribe();
    
  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}

// Export for use in settings refresh
export { getUserNotificationSettings, getNotificationCategory };
