
import { Notification as DealNotification } from "@/types/deal";

// Re-export the Notification type from deal.ts for clarity
export type Notification = DealNotification;

// Define database notification format
export interface DbNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: string;
  deal_id?: string;
  user_id: string;
  link?: string;
}
