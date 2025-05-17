
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { Notification } from "@/types/deal";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotificationSubscription
} from "@/services/notificationService";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all notifications for current user
  const loadNotifications = async () => {
    setLoading(true);
    const data = await fetchNotifications();
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
    
    setLoading(false);
  };

  // Mark a notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId);
    
    if (success) {
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    const success = await markAllNotificationsAsRead();
    
    if (success) {
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  // Delete a notification
  const handleDeleteNotification = async (notificationId: string) => {
    const success = await deleteNotification(notificationId);
    
    if (success) {
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  // Setup realtime subscription for new notifications
  useEffect(() => {
    loadNotifications();
    
    // Set up realtime subscription
    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      return createNotificationSubscription(
        session.user.id,
        (newNotification) => {
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
      );
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
    fetchNotifications: loadNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification
  };
};

export default useNotifications;
