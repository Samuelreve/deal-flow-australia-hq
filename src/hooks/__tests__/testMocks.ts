
import { vi } from 'vitest';

// Mock Supabase data
export const mockSupabaseDeals = [
  {
    id: "1",
    title: "Test Deal 1",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    health_score: 75,
    seller_id: "seller1",
    buyer_id: "buyer1",
    asking_price: 100000,
    business_legal_name: "Test Business 1",
    business_industry: "Technology",
    target_completion_date: "2024-12-31",
    seller: { name: "Seller Name" },
    buyer: { name: "Buyer Name" }
  },
  {
    id: "2",
    title: "Test Deal 2",
    status: "completed",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    health_score: 100,
    seller_id: "seller2",
    buyer_id: "buyer2",
    asking_price: 200000,
    business_legal_name: "Test Business 2",
    business_industry: "Finance",
    target_completion_date: "2024-11-30",
    seller: { name: "Seller Name 2" },
    buyer: { name: "Buyer Name 2" }
  },
  {
    id: "3",
    title: "Test Draft Deal",
    status: "draft",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
    health_score: 30,
    seller_id: "seller3",
    buyer_id: null,
    asking_price: 50000,
    business_legal_name: "Test Business 3",
    business_industry: "Retail",
    target_completion_date: "2025-01-31",
    seller: { name: "Seller Name 3" },
    buyer: null
  }
];

// Mock setup function
export const setupMocks = () => {
  // Reset all mocks
  vi.clearAllMocks();
};

// Mock supabase client
export const supabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  rpc: vi.fn()
};
