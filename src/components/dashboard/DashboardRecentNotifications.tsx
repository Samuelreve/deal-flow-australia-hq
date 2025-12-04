
import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
}

interface DashboardRecentNotificationsProps {
  notifications: Notification[];
}

const DashboardRecentNotifications = ({ notifications }: DashboardRecentNotificationsProps) => {
  const navigate = useNavigate();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-destructive/15 text-destructive border-destructive/20';
      case 'warning':
        return 'bg-warning/15 text-warning border-warning/20';
      case 'success':
        return 'bg-success/15 text-success border-success/20';
      default:
        return 'bg-info/15 text-info border-info/20';
    }
  };

  return (
    <GlassCard className="p-0 overflow-hidden h-full">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="text-sm text-muted-foreground">Latest updates and alerts</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/notifications')}
            className="text-muted-foreground hover:text-foreground"
          >
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="divide-y divide-border/50">
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map((notification, index) => (
            <div 
              key={notification.id} 
              className="flex items-start justify-between p-4 hover:bg-muted/30 transition-colors"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                <div className={`h-2 w-2 mt-2 rounded-full flex-shrink-0 ${
                  notification.read ? 'bg-muted-foreground/30' : 'bg-primary animate-pulse'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className={`font-medium text-foreground ${notification.read ? 'opacity-70' : ''}`}>
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                </div>
              </div>
              <Badge className={`border ml-2 flex-shrink-0 ${getTypeColor(notification.type)}`} variant="outline">
                {notification.type}
              </Badge>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No notifications</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default DashboardRecentNotifications;
