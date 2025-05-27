
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Notifications</CardTitle>
        <CardDescription>Latest updates and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className={`h-2.5 w-2.5 mt-1.5 rounded-full ${
                    notification.read ? 'bg-gray-300' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge variant={
                    notification.type === 'error' ? 'destructive' : 
                    notification.type === 'warning' ? 'default' : 'outline'
                  }>
                    {notification.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No notifications</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardRecentNotifications;
