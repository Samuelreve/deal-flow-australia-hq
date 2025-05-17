
import { useState, useEffect, useCallback } from "react";
import { Notification } from "@/types/notifications";
import { 
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from "@/services/notificationService";
import { useNotificationSubscription } from "@/hooks/useNotificationSubscription";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all notifications for current user
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const data = await fetchNotifications();
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
    
    setLoading(false);
  }, []);

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

  // Handle new notifications from subscription
  const handleNewNotification = useCallback((newNotification: Notification) => {
    // Update state with the new notification
    setNotifications(prev => [newNotification, ...prev]);
    
    if (!newNotification.read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Setup notification subscription
  useNotificationSubscription(handleNewNotification);

  // Load notifications on initial mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

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
