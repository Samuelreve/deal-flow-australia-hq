
import { useState, useEffect } from 'react';
import { notificationsService, Notification } from '@/services/notificationsService';
import { useAuth } from '@/contexts/AuthContext';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
};
