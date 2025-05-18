
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

describe("useDeals hook - Filtering", () => {
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

  test("should handle filter by status correctly", async () => {
    const { result } = renderHook(() => useDeals("user123"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Initially all deals should be shown
    expect(result.current.filteredDeals.length).toBe(3);
    
    // Filter by active status
    act(() => {
      result.current.setStatusFilter("active");
    });
    
    expect(result.current.statusFilter).toBe("active");
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].status).toBe("active");
    
    // Filter by completed status
    act(() => {
      result.current.setStatusFilter("completed");
    });
    
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].status).toBe("completed");
    
    // Filter by draft status
    act(() => {
      result.current.setStatusFilter("draft");
    });
    
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].status).toBe("draft");
    
    // Reset to all
    act(() => {
      result.current.setStatusFilter("all");
    });
    
    expect(result.current.filteredDeals.length).toBe(3);
  });

  test("should handle search filter correctly", async () => {
    const { result } = renderHook(() => useDeals("user123"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Search for "Test Deal 1"
    act(() => {
      result.current.setSearchTerm("Test Deal 1");
    });
    
    expect(result.current.searchTerm).toBe("Test Deal 1");
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].title).toBe("Test Deal 1");
    
    // Search for "Draft" should return the draft deal
    act(() => {
      result.current.setSearchTerm("Draft");
    });
    
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].title).toBe("Test Draft Deal");
    
    // Search for non-existent term
    act(() => {
      result.current.setSearchTerm("Nonexistent");
    });
    
    expect(result.current.filteredDeals.length).toBe(0);
    
    // Clear search
    act(() => {
      result.current.setSearchTerm("");
    });
    
    expect(result.current.filteredDeals.length).toBe(3);
  });
});
