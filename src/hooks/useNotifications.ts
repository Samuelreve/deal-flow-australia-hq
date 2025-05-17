
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Notification } from "@/types/deal";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all notifications for current user
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Transform to match our Notification type
      const formattedNotifications: Notification[] = data.map(n => ({
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
      }));
      
      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("recipient_user_id", session.user.id)
        .eq("read", false);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);
      
      if (error) throw error;
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success("Notification removed");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to remove notification");
    }
  };

  // Setup realtime subscription for new notifications
  useEffect(() => {
    fetchNotifications();
    
    // Set up realtime subscription
    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_user_id=eq.${session.user.id}`
          },
          (payload) => {
            console.log("New notification received:", payload);
            
            // Format the notification
            const newNotification: Notification = {
              id: payload.new.id,
              title: payload.new.title,
              message: payload.new.message || "",
              createdAt: new Date(payload.new.created_at),
              read: payload.new.read,
              type: (payload.new.type.includes("error") ? "error" : 
                     payload.new.type.includes("warning") ? "warning" :
                     payload.new.type.includes("success") ? "success" : "info") as "info" | "warning" | "success" | "error",
              dealId: payload.new.deal_id || undefined,
              userId: payload.new.user_id,
              link: payload.new.link || undefined,
            };
            
            // Update state with the new notification
            setNotifications(prev => [newNotification, ...prev]);
            if (!newNotification.read) {
              setUnreadCount(prev => prev + 1);
              
              // Show a toast for the new notification
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
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    const cleanup = setupSubscription();
    return () => {
      cleanup.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
