
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/deal";
import { toast } from "@/components/ui/sonner";

export async function fetchNotifications(): Promise<Notification[] | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    // Transform to match our Notification type
    return data.map(n => mapNotificationFromDb(n));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    toast.error("Failed to load notifications");
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
      .eq("recipient_user_id", session.user.id)
      .eq("read", false);
    
    if (error) throw error;
    
    toast.success("All notifications marked as read");
    return true;
  } catch (error) {
    console.error("Error marking all as read:", error);
    toast.error("Failed to mark all as read");
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
    
    toast.success("Notification removed");
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    toast.error("Failed to remove notification");
    return false;
  }
}

// Helper to convert DB notification to our app's Notification type
export function mapNotificationFromDb(n: any): Notification {
  return {
    id: n.id,
    title: n.title,
    message: n.message || "",
    createdAt: new Date(n.created_at),
    read: n.read,
    type: (n.type.includes("error") ? "error" : 
           n.type.includes("warning") ? "warning" :
           n.type.includes("success") ? "success" : "info") as "info" | "warning" | "success" | "error",
    dealId: n.deal_id || undefined,
    userId: n.user_id,
    link: n.link || undefined,
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
        filter: `recipient_user_id=eq.${userId}`
      },
      (payload) => {
        console.log("New notification received:", payload);
        
        // Format the notification
        const newNotification = mapNotificationFromDb(payload.new);
        
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
