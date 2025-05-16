
import { Deal, DealStatus, DealSummary } from "@/types/deal";

// Mock deal summaries
export const mockDealSummaries: DealSummary[] = [
  {
    id: "deal-1",
    title: "ABC Café Sale",
    status: "active",
    createdAt: new Date(2023, 3, 15),
    updatedAt: new Date(),
    healthScore: 85,
    nextMilestone: "Due Diligence",
    nextAction: "Upload financial documents",
    sellerId: "1",
    buyerId: "2",
    sellerName: "John Seller",
    buyerName: "Jane Buyer"
  },
  {
    id: "deal-2",
    title: "XYZ Tech Acquisition",
    status: "pending",
    createdAt: new Date(2023, 2, 10),
    updatedAt: new Date(2023, 5, 20),
    healthScore: 65,
    nextMilestone: "NDA Signing",
    nextAction: "Review NDA document",
    sellerId: "1",
    buyerName: "Potential Buyer"
  },
  {
    id: "deal-3",
    title: "123 Bakery Purchase",
    status: "completed",
    createdAt: new Date(2023, 1, 5),
    updatedAt: new Date(2023, 4, 25),
    healthScore: 100,
    sellerId: "3",
    buyerId: "2",
    sellerName: "Sarah Owner",
    buyerName: "Jane Buyer"
  },
  {
    id: "deal-4",
    title: "Local Bookstore Sale",
    status: "draft",
    createdAt: new Date(2023, 5, 1),
    updatedAt: new Date(2023, 5, 1),
    healthScore: 30,
    nextMilestone: "Business Valuation",
    nextAction: "Complete business profile",
    sellerId: "1",
    sellerName: "John Seller"
  }
];

// Full deal data (simplified version)
export const mockDeals: Record<string, Deal> = {
  "deal-1": {
    id: "deal-1",
    title: "ABC Café Sale",
    description: "Sale of downtown coffee shop with 5 years of operation",
    price: 450000,
    status: "active" as DealStatus,
    sellerId: "1",
    buyerId: "2",
    lawyerIds: ["3"],
    createdAt: new Date(2023, 3, 15),
    updatedAt: new Date(),
    milestones: [
      {
        id: "ms-1",
        title: "NDA Signing",
        description: "Confidentiality agreement between parties",
        status: "completed",
        completedAt: new Date(2023, 3, 20),
        documents: []
      },
      {
        id: "ms-2",
        title: "Due Diligence",
        description: "Review of business finances and operations",
        status: "in_progress",
        dueDate: new Date(2023, 6, 30),
        documents: []
      },
      {
        id: "ms-3",
        title: "Final Agreement",
        description: "Drafting and signing of final sale agreement",
        status: "not_started",
        documents: []
      }
    ],
    documents: [
      {
        id: "doc-1",
        name: "NDA.pdf",
        url: "#",
        uploadedBy: "1",
        uploadedAt: new Date(2023, 3, 16),
        size: 245000,
        type: "application/pdf",
        status: "signed",
        version: 1
      },
      {
        id: "doc-2",
        name: "Financial_Summary_2022.xlsx",
        url: "#",
        uploadedBy: "1",
        uploadedAt: new Date(2023, 5, 10),
        size: 1245000,
        type: "application/xlsx",
        status: "final",
        version: 2
      }
    ],
    healthScore: 85,
    comments: [
      {
        id: "com-1",
        userId: "2",
        content: "Need detailed breakdown of monthly revenues for last 2 years",
        createdAt: new Date(2023, 5, 15),
        dealId: "deal-1"
      }
    ],
    participants: [
      {
        id: "1",
        role: "seller",
        joined: new Date(2023, 3, 15)
      },
      {
        id: "2",
        role: "buyer",
        joined: new Date(2023, 3, 18)
      },
      {
        id: "3",
        role: "lawyer",
        joined: new Date(2023, 3, 22)
      }
    ]
  }
};

// Get mock deal data by ID
export const getMockDeal = (id: string): Deal | undefined => {
  return mockDeals[id];
};

// Get mock deal summaries based on user role and ID
export const getMockDealSummariesForUser = (userId: string, role: string): DealSummary[] => {
  switch(role) {
    case "seller":
      return mockDealSummaries.filter(deal => deal.sellerId === userId);
    case "buyer":
      return mockDealSummaries.filter(deal => deal.buyerId === userId);
    case "admin":
      return mockDealSummaries; // Admins see all deals
    case "lawyer":
      // In a real app, we'd have a way to associate lawyers with deals
      // For demo, let's show the first 2 deals
      return mockDealSummaries.slice(0, 2);
    default:
      return [];
  }
};
