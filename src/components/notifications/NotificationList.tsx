
import React from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const NotificationList = () => {
  const { 
    notifications, 
    loading, 
    markAllAsRead 
  } = useNotifications();
  
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.filter(n => !n.read).length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => markAllAsRead()}
          >
            Mark all as read
          </Button>
        )}
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">You don't have any notifications yet.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
            >
              Return to dashboard
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => {}}
                onDelete={() => {}}
                displayFull
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
