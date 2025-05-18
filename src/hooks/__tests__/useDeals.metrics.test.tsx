
import { renderHook, waitFor } from "@testing-library/react";
import { useDeals } from "../useDeals";
import { supabase } from "@/integrations/supabase/client";
import { mockDeals, mockSupabaseDeals, setupMocks } from "./utils/testUtils";

// Mock Supabase client
jest.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
  },
}));

describe("useDeals hook - Metrics", () => {
  beforeEach(() => {
    setupMocks();
    
    // Setup the mock implementation for Supabase
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: mockSupabaseDeals,
        error: null
      })
    }));
  });

  test("should calculate metrics correctly", async () => {
    const { result } = renderHook(() => useDeals("user123"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Check metrics
    expect(result.current.metrics.total).toBe(3);
    expect(result.current.metrics.active).toBe(1);
    expect(result.current.metrics.completed).toBe(1);
    expect(result.current.metrics.draft).toBe(1);
    
    // Check average health score of active deals
    expect(result.current.activeDeals.length).toBe(1);
    expect(result.current.averageHealthScore).toBe(75);
  });
});
