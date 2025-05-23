
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/services/notificationsService";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationItem from "./NotificationItem";
import { toast } from "sonner";
import { useEffect } from "react";

export const NotificationsDropdown = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  } = useNotifications();
  
  const navigate = useNavigate();
  
  // Auto-refresh notifications periodically to check for new nudges
  useEffect(() => {
    // Fetch notifications every 5 minutes
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);
  
  // Handle notification click with navigation
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if needed
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate to linked content if available
    if (notification.link) {
      // Close dropdown first
      const trigger = document.querySelector('[data-state="open"]') as HTMLElement;
      if (trigger) trigger.click();
      
      // Navigate to the link
      navigate(notification.link);
    } else if (notification.deal_id) {
      // Close dropdown first
      const trigger = document.querySelector('[data-state="open"]') as HTMLElement;
      if (trigger) trigger.click();
      
      // Navigate to the deal
      navigate(`/deals/${notification.deal_id}`);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold text-sm flex items-center">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-muted text-muted-foreground text-xs py-0.5 px-1.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => markAllAsRead()}
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[400px] px-2">
          <DropdownMenuGroup className="p-2">
            {loading ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                // Transform notification to match expected interface
                const transformedNotification = {
                  ...notification,
                  user_id: notification.id, // placeholder
                  related_entity_id: notification.deal_id,
                  related_entity_type: notification.deal_id ? 'deal' : null
                };
                
                return (
                  <NotificationItem
                    key={notification.id}
                    notification={transformedNotification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    onNotificationClick={handleNotificationClick}
                    onClose={() => {
                      const trigger = document.querySelector('[data-state="open"]') as HTMLElement;
                      if (trigger) trigger.click(); // Close the dropdown
                    }}
                  />
                );
              })
            )}
          </DropdownMenuGroup>
        </ScrollArea>

        <div className="p-2 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => {
              navigate("/notifications");
              const trigger = document.querySelector('[data-state="open"]') as HTMLElement;
              if (trigger) trigger.click(); // Close the dropdown
            }}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
