
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, FileText, Info, Users, AlertCircle, Bell, Loader2 } from 'lucide-react';

// Define the interface for a single notification
export interface Notification {
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

interface NotificationItemProps {
  notification: Notification;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead: (id: string) => Promise<void>;
  updatingNotificationId?: string | null;
  onDelete?: (id: string) => Promise<void>;
  onClose?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onNotificationClick,
  onMarkAsRead,
  updatingNotificationId,
  onDelete,
  onClose,
}) => {
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

  const handleClick = () => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    // If in dropdown, close it
    if (onClose) {
      onClose();
    }
  };

  return (
    <li
      className={`flex items-start space-x-3 p-3 rounded-md cursor-pointer ${notification.read ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-gray-900 hover:bg-blue-100'}`}
      onClick={handleClick}
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
          onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}
          className="flex-shrink-0 px-2 py-0.5 text-xs text-blue-600 border border-blue-600 rounded-full hover:bg-blue-100"
        >
          Mark as Read
        </button>
      )}
      {updatingNotificationId === notification.id && (
        <span className="flex-shrink-0 text-xs text-blue-600">Updating...</span>
      )}
    </li>
  );
};

export default NotificationItem;
