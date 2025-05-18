
import { DealSummary } from "@/types/deal";
import { vi } from "vitest";

// Sample mock data for tests
export const mockDeals: DealSummary[] = [
  {
    id: "1",
    title: "Test Deal 1",
    status: "active",
    createdAt: new Date("2023-05-01T10:00:00Z"),
    updatedAt: new Date("2023-05-10T15:30:00Z"),
    healthScore: 75,
    sellerId: "seller1",
    buyerId: "buyer1",
    sellerName: "Seller Name"
  },
  {
    id: "2",
    title: "Test Deal 2",
    status: "completed",
    createdAt: new Date("2023-04-01T10:00:00Z"),
    updatedAt: new Date("2023-04-20T15:30:00Z"),
    healthScore: 100,
    sellerId: "seller1",
    buyerId: "buyer2",
    sellerName: "Seller Name"
  },
  {
    id: "3",
    title: "Test Draft Deal",
    status: "draft",
    createdAt: new Date("2023-06-01T10:00:00Z"),
    updatedAt: new Date("2023-06-02T15:30:00Z"),
    healthScore: 30,
    sellerId: "seller1",
    buyerId: null,
    sellerName: "Seller Name"
  }
];

// Mock Supabase response data format
export const mockSupabaseDeals = mockDeals.map(deal => ({
  id: deal.id,
  title: deal.title,
  status: deal.status,
  created_at: deal.createdAt.toISOString(),
  updated_at: deal.updatedAt.toISOString(),
  health_score: deal.healthScore,
  seller_id: deal.sellerId,
  buyer_id: deal.buyerId,
  profiles: { name: deal.sellerName }
}));

// Setup and teardown helpers
export const setupMocks = () => {
  vi.clearAllMocks();
  
  // Add extra setup for mocking select method
  vi.mock("@/integrations/supabase/client", () => ({
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    },
  }), { virtual: true });
};
