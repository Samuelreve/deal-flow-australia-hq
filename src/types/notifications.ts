
import { Notification as NotificationItemType } from "@/components/notifications/NotificationItem";

// Re-export the Notification type from NotificationItem.tsx for consistency
export type Notification = NotificationItemType;

// Define database notification format
export interface DbNotification {
  id: string;
  title: string;
  message: string | null;
  created_at: string;
  read: boolean;
  type: string;
  deal_id?: string | null;
  user_id: string;
  link?: string | null;
  related_entity_id?: string | null;
  related_entity_type?: string | null;
  category?: 'deal_update' | 'message' | 'document_comment' | null;
}
