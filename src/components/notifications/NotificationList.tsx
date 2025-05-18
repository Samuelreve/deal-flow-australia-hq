
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationList } from '@/hooks/useNotificationList';
import NotificationItem from './NotificationItem';
import NotificationFilters from './NotificationFilters';
import NotificationPagination from './NotificationPagination';
import MarkAllAsReadButton from './MarkAllAsReadButton';

interface NotificationListProps {
  // No specific props needed if fetching for the current user
}

const NotificationList: React.FC<NotificationListProps> = () => {
  const navigate = useNavigate();
  const {
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
  } = useNotificationList();

  // Handle notification click with navigation
  const handleNotificationClick = (notification: React.ComponentProps<typeof NotificationItem>['notification']) => {
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
          <NotificationFilters
            filterStatus={filterStatus}
            filterType={filterType}
            onStatusChange={handleFilterStatusChange}
            onTypeChange={handleFilterTypeChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPage={itemsPerPage}
          />

          {/* Mark All as Read Button */}
          {!authLoading && user && notifications.length > 0 && (
            <MarkAllAsReadButton
              onClick={markAllNotificationsAsRead}
              disabled={notifications.every(n => n.read)}
              loading={markingAllRead}
            />
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
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onNotificationClick={handleNotificationClick}
                  onMarkAsRead={markNotificationAsRead}
                  updatingNotificationId={updatingNotificationId}
                />
              ))}
            </ul>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <NotificationPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )
      )}
    </div>
  );
};

export default NotificationList;
