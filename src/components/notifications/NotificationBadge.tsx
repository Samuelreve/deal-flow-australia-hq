
import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";

interface NotificationBadgeProps {
  onClick?: () => void;
}

const NotificationBadge = ({ onClick }: NotificationBadgeProps) => {
  const { unreadCount, loading } = useNotifications();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate("/notifications");
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      onClick={handleClick}
      aria-label={`You have ${unreadCount} unread notifications`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
      
      {/* Optional: Loading indicator */}
      {loading && (
        <span className="absolute top-0 right-0 inline-flex h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
      )}
    </Button>
  );
};

export default NotificationBadge;
