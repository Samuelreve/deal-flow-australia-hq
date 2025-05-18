
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle, AlertCircle, Info, MailOpen, FileText, Users, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Define the interface for a single notification
interface Notification {
  id: string;
  user_id: string;
  deal_id: string | null;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  created_at: string;
  related_entity_id: string | null;
  related_entity_type: string | null;
  link: string | null;
}

interface NotificationListProps {
  // No specific props needed if fetching for the current user
}

const NotificationList: React.FC<NotificationListProps> = () => {
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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

  // State to hold the Supabase Realtime channel
  const [countChannel, setCountChannel] = useState<RealtimeChannel | null>(null);

  // Function to fetch notifications from Supabase for the current user with filtering and pagination
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

  // Helper function to get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'milestone_status_updated': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'document_uploaded': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'message_added': return <Info className="h-5 w-5 text-gray-500" />;
      case 'participant_added': return <Users className="h-5 w-5 text-purple-500" />;
      case 'deal_status_changed': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Helper function to format time distance
  const formatTimeAgo = (timestamp: string) => {
      try {
          return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
      } catch (e) {
          console.error('Error formatting time:', timestamp, e);
          return timestamp;
      }
  };

  // Helper function to get notification types for filter dropdown
  const getNotificationTypes = () => {
    const types = [
      { value: 'all', label: 'All Types' },
      { value: 'milestone_status_updated', label: 'Milestone Updates' },
      { value: 'document_uploaded', label: 'Document Uploads' },
      { value: 'message_added', label: 'Messages' },
      { value: 'participant_added', label: 'Participant Added' },
      { value: 'deal_status_changed', label: 'Deal Status Changes' }
    ];
    return types;
  };

  // Handle notification click with navigation
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    
    // Navigate to the related content if link is provided
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Your Notifications</h3>

      {/* Filtering and Pagination Controls */}
      {!authLoading && user && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <Select
              value={filterStatus}
              onValueChange={(value) => handleFilterStatusChange(value as 'all' | 'read' | 'unread')}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={filterType}
              onValueChange={handleFilterTypeChange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {getNotificationTypes().map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Items per page */}
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mark All as Read Button */}
          {!authLoading && user && notifications.length > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              disabled={markingAllRead || notifications.every(n => n.read)}
              className={`flex items-center px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 ${markingAllRead || notifications.every(n => n.read) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {markingAllRead ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MailOpen className="mr-2 h-4 w-4" />
              )}
              Mark All as Read
            </button>
          )}
        </div>
      )}

      {/* Loading and Error Indicators */}
      {authLoading ? (
         <p className="text-center text-blue-600">Loading user authentication...</p>
      ) : !user ? (
         <p className="text-center text-gray-600">Please sign in to view notifications.</p>
      ) : loadingNotifications ? (
         <p className="text-center text-blue-600">Loading notifications...</p>
      ) : fetchError ? (
         <p className="text-center text-red-600">Error loading notifications: {fetchError}</p>
      ) : (
        /* Notifications List */
        notifications.length === 0 ? (
          <p className="text-gray-600 text-center">No notifications found with current filters.</p>
        ) : (
          <>
            <ul className="space-y-4 mb-4">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 rounded-md cursor-pointer ${notification.read ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-gray-900 hover:bg-blue-100'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Notification Icon */}
                  <div className="flex-shrink-0 mt-1">
                     {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    {/* Notification Title */}
                    <p className={`text-sm font-semibold ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
                      {notification.title}
                    </p>
                    {/* Notification Body (Optional) */}
                    {notification.message && (
                      <p className="text-sm mt-1">{notification.message}</p>
                    )}
                    {/* Timestamp */}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                    {notification.link && (
                      <p className="text-xs text-blue-600 mt-1 hover:underline">View Details</p>
                    )}
                  </div>
                  {/* Mark as Read button if not read */}
                  {!notification.read && updatingNotificationId !== notification.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markNotificationAsRead(notification.id); }}
                      className="flex-shrink-0 px-2 py-0.5 text-xs text-blue-600 border border-blue-600 rounded-full hover:bg-blue-100"
                    >
                      Mark as Read
                    </button>
                  )}
                  {updatingNotificationId === notification.id && (
                    <span className="flex-shrink-0 text-xs text-blue-600">Updating...</span>
                  )}
                </li>
              ))}
            </ul>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* First Page */}
                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(1)}>
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <span className="flex h-9 w-9 items-center justify-center">...</span>
                    </PaginationItem>
                  )}
                  
                  {/* Previous Page */}
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(currentPage - 1)}>
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Current Page */}
                  <PaginationItem>
                    <PaginationLink isActive>
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                  
                  {/* Next Page */}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(currentPage + 1)}>
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <span className="flex h-9 w-9 items-center justify-center">...</span>
                    </PaginationItem>
                  )}
                  
                  {/* Last Page */}
                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )
      )}
    </div>
  );
};

export default NotificationList;
