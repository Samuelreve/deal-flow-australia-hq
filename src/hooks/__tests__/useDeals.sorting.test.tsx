
import { renderHook, act, waitFor } from "@testing-library/react";
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

describe("useDeals hook - Sorting", () => {
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

  test("should handle sort correctly", async () => {
    const { result } = renderHook(() => useDeals("user123"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Sort by title ascending
    act(() => {
      result.current.setSortBy("title");
      result.current.setSortOrder("asc");
    });
    
    expect(result.current.filteredDeals[0].title).toBe("Test Deal 1");
    expect(result.current.filteredDeals[1].title).toBe("Test Deal 2");
    expect(result.current.filteredDeals[2].title).toBe("Test Draft Deal");
    
    // Sort by title descending
    act(() => {
      result.current.setSortOrder("desc");
    });
    
    expect(result.current.filteredDeals[0].title).toBe("Test Draft Deal");
    expect(result.current.filteredDeals[1].title).toBe("Test Deal 2");
    expect(result.current.filteredDeals[2].title).toBe("Test Deal 1");
    
    // Sort by health score ascending
    act(() => {
      result.current.setSortBy("healthScore");
      result.current.setSortOrder("asc");
    });
    
    expect(result.current.filteredDeals[0].healthScore).toBe(30);
    expect(result.current.filteredDeals[1].healthScore).toBe(75);
    expect(result.current.filteredDeals[2].healthScore).toBe(100);
  });
});
