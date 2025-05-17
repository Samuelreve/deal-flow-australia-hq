
import React from "react";
import NotificationList from "@/components/notifications/NotificationList";
import AppLayout from "@/components/layout/AppLayout";

const NotificationsPage: React.FC = () => {
  return (
    <AppLayout>
      <NotificationList />
    </AppLayout>
  );
};

export default NotificationsPage;
