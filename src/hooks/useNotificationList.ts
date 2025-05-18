
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/components/notifications/NotificationItem';

export function useNotificationList() {
  const { user, session, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updatingNotificationId, setUpdatingNotificationId] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // State for Filtering
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [filterType, setFilterType] = useState<'all' | string>('all');

  // State for Pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const authToken = session?.access_token || '';
  const currentUserId = user?.id || '';

  // Function to fetch notifications with filtering and pagination
  const fetchNotifications = useCallback(async (
    statusFilter: 'all' | 'read' | 'unread',
    typeFilter: 'all' | string,
    limit: number,
    page: number
  ) => {
    if (!currentUserId || !authToken) {
      setLoadingNotifications(false);
      setNotifications([]);
      setTotalNotifications(0);
      setTotalPages(0);
      return;
    }

    setLoadingNotifications(true);
    setFetchError(null);

    try {
      // Calculate offset from page number and limit
      const offset = (page - 1) * limit;

      // Start building the Supabase query for count
      let countQuery = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', currentUserId);

      // Apply filters to count query
      if (statusFilter !== 'all') {
        countQuery = countQuery.eq('read', statusFilter === 'read');
      }
      if (typeFilter !== 'all') {
        countQuery = countQuery.eq('type', typeFilter);
      }

      // Execute count query
      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error('Error counting notifications:', countError);
        throw new Error(countError.message || 'Failed to count notifications.');
      }

      // Update pagination state
      setTotalNotifications(count || 0);
      setTotalPages(Math.ceil((count || 0) / limit));

      // Start building the Supabase query for data
      let dataQuery = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUserId);

      // Apply filters to data query
      if (statusFilter !== 'all') {
        dataQuery = dataQuery.eq('read', statusFilter === 'read');
      }
      if (typeFilter !== 'all') {
        dataQuery = dataQuery.eq('type', typeFilter);
      }

      // Apply pagination and ordering
      dataQuery = dataQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Execute data query
      const { data, error: dataError } = await dataQuery;

      if (dataError) {
        console.error('Error fetching notifications:', dataError);
        throw new Error(dataError.message || 'Failed to fetch notifications.');
      }

      setNotifications(data as Notification[]);

    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setFetchError(`Failed to load notifications: ${error.message}`);
      toast.error(`Failed to load notifications: ${error.message}`);
      setNotifications([]);
      setTotalNotifications(0);
      setTotalPages(0);
    } finally {
      setLoadingNotifications(false);
    }
  }, [currentUserId, authToken]);

  // Function to mark a single notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    if (!currentUserId || !authToken) {
       toast.error('Authentication error. Cannot mark notification as read.');
       return;
    }

    setUpdatingNotificationId(notificationId);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', currentUserId)
        .select('*')
        .single();

      if (error) {
        console.error('Error marking notification as read:', error);
        throw new Error(error.message || 'Failed to mark notification as read.');
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notificationId ? (data as Notification) : n
        )
      );

    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast.error(`Failed to mark notification as read: ${error.message}`);
    } finally {
      setUpdatingNotificationId(null);
    }
  }, [currentUserId, authToken]);

  // Function to mark ALL notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
      if (!currentUserId || !authToken) {
         toast.error('Authentication error. Cannot mark all notifications as read.');
         return;
      }
      if (notifications.every(n => n.read)) {
          toast.info('All notifications are already read.');
          return;
      }

      setMarkingAllRead(true);

      try {
        const { data, error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', currentUserId)
          .eq('read', false);

        if (error) {
          console.error('Error marking all notifications as read:', error);
          throw new Error(error.message || 'Failed to mark all notifications as read.');
        }

        setNotifications(prevNotifications =>
          prevNotifications.map(n => ({ ...n, read: true }))
        );

        toast.success('All notifications marked as read!');

      } catch (error: any) {
        console.error('Error marking all notifications as read:', error);
        toast.error(`Failed to mark all notifications as read: ${error.message}`);
      } finally {
        setMarkingAllRead(false);
      }
  }, [currentUserId, authToken, notifications]);

  // Handlers for filters and pagination
  const handleFilterStatusChange = (status: 'all' | 'read' | 'unread') => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleFilterTypeChange = (type: string) => {
    setFilterType(type);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleItemsPerPageChange = (items: string) => {
    setItemsPerPage(Number(items));
    setCurrentPage(1); // Reset to first page on items per page change
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Effect to fetch notifications when filters, pagination, or auth state changes
  useEffect(() => {
    if (!authLoading && user) {
      fetchNotifications(
        filterStatus,
        filterType,
        itemsPerPage,
        currentPage
      );
    } else if (!authLoading && !user) {
       setNotifications([]);
       setTotalNotifications(0);
       setTotalPages(0);
       setLoadingNotifications(false);
       setFetchError(null);
    }
  }, [user, authLoading, fetchNotifications, filterStatus, filterType, itemsPerPage, currentPage]);

  return {
    notifications,
    loadingNotifications,
    fetchError,
    updatingNotificationId,
    markingAllRead,
    filterStatus,
    filterType,
    itemsPerPage,
    currentPage,
    totalPages,
    authLoading,
    user,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    handleFilterStatusChange,
    handleFilterTypeChange,
    handleItemsPerPageChange,
    handlePageChange
  };
}
