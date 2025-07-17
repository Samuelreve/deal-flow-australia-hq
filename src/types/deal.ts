
import { User, UserRole } from "@/types/auth";

// Define milestone status
export type MilestoneStatus = "not_started" | "in_progress" | "completed" | "blocked";

// Define milestone type
export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate?: Date;
  assignedTo?: string[];
  completedAt?: Date;
  documents?: Document[];
  order_index?: number; // Added order_index for sequential milestone logic (optional for backward compatibility)
}

// Define document version type
export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  size: number;
  type: string;
  description?: string;
}

// Define document type
export interface Document {
  id: string;
  name: string;
  url: string;
  uploadedBy: string;
  uploaderName?: string;
  uploadedAt: Date;
  size: number;
  type: string;
  status: "draft" | "final" | "signed";
  version: number;
  category?: string;
  comments?: Comment[];
  versions?: DocumentVersion[]; // Added versions array
  latestVersionId?: string; // Added reference to latest version
  latestVersion?: DocumentVersion; // Added latest version object
}

// Define comment type
export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  documentId?: string;
  milestoneId?: string;
  dealId?: string;
}

// Define notification type
export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
  dealId?: string;
  userId: string;
  link?: string;
}

// Define deal status
export type DealStatus = "draft" | "active" | "pending" | "completed" | "cancelled";

// Define deal type
export interface Deal {
  id: string;
  title: string;
  description: string;
  price?: number;
  status: DealStatus;
  sellerId: string;
  buyerId?: string;
  lawyerIds?: string[];
  adminId?: string;
  createdAt: Date;
  updatedAt: Date;
  closingDate?: Date;
  milestones: Milestone[];
  documents: Document[];
  healthScore: number; // 0-100
  comments: Comment[];
  businessName?: string; // Added businessName field
  participants: {
    id: string;
    role: UserRole;
    joined: Date;
  }[];
}

// Define deal summary for dashboard lists
export interface DealSummary {
  id: string;
  title: string;
  status: DealStatus;
  createdAt: Date;  // This expects a Date object, not a string
  updatedAt: Date;  // This expects a Date object, not a string
  healthScore: number;
  nextMilestone?: string;
  nextAction?: string;
  sellerId: string;
  buyerId?: string;
  sellerName?: string;
  buyerName?: string;
  businessName?: string; // Added businessName field
}
