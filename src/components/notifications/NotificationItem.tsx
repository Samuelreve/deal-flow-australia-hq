
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, Trash2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Notification } from "@/types/deal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose?: () => void;
}

const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  onClose 
}: NotificationItemProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleNavigate = () => {
    if (notification.link) {
      if (onClose) onClose();
      navigate(notification.link);
      if (!notification.read) {
        onMarkAsRead(notification.id);
      }
    }
  };
  
  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    await onMarkAsRead(notification.id);
    setIsLoading(false);
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    await onDelete(notification.id);
    setIsLoading(false);
  };
  
  // Get notification type style
  const getTypeStyles = () => {
    switch (notification.type) {
      case "error":
        return "border-l-destructive";
      case "warning":
        return "border-l-yellow-500";
      case "success":
        return "border-l-green-500";
      default:
        return "border-l-blue-500";
    }
  };
  
  return (
    <div 
      className={cn(
        "p-4 border-l-4 mb-2 rounded bg-card hover:bg-accent transition-colors",
        getTypeStyles(),
        notification.read ? "opacity-70" : "",
        notification.link ? "cursor-pointer" : "",
      )}
      onClick={notification.link ? handleNavigate : undefined}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
          {notification.title}
        </h4>
        <div className="flex items-center space-x-1">
          {!notification.read && (
            <Button
              onClick={handleMarkAsRead}
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-primary"
              disabled={isLoading}
              title="Mark as read"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            disabled={isLoading}
            title="Delete notification"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </span>
        {notification.link && (
          <span className="text-primary flex items-center">
            View <ExternalLink className="h-3 w-3 ml-1" />
          </span>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
